import Phaser from 'phaser';

type SceneConfig = Phaser.Types.Scenes.SettingsConfig & {
    onSelectLocation?: (loc: { name: string; props: Record<string, any> }) => void;
};

export default class WorldMapScene extends Phaser.Scene {
    private onSelectLocation?: (loc: { name: string; props: Record<string, any> }) => void;
    private map!: Phaser.Tilemaps.Tilemap;
    private imageLayer?: Phaser.GameObjects.Image;
    private hitAreas: Phaser.GameObjects.Zone[] = [];
    private hoverGraphics?: Phaser.GameObjects.Graphics;

    constructor(config: SceneConfig) {
        super(config);
        this.onSelectLocation = config.onSelectLocation;
    }

    preload() {
        // TMJ + image live here:
        // public/assets/wizarding/maps/map.tmj
        // public/assets/wizarding/maps/map_blur_act3.png

        this.load.tilemapTiledJSON('world-map', '/assets/wizarding/maps/map.tmj');

        // If TMJ uses an Image Layer, load the image it references:
        this.load.image('world-map-image', '/assets/wizarding/maps/map_blur_act3.png');

        // You could also load a tileset image if the TMJ references one:
        // this.load.image('your-tileset-key', '/path/to/tileset.png');

        // Minimal loading indicator
        const w = this.scale.width, h = this.scale.height;
        const text = this.add.text(w / 2, h / 2, 'Loading map…', { color: '#ffffff' })
            .setOrigin(0.5);
        this.load.once('complete', () => text.destroy());
    }

    create() {
        // Build map
        this.map = this.make.tilemap({ key: 'world-map' });

        // If the TMJ is just an image layer map, we simply show the image at 0,0
        // If it's a tileset map, you'd need to addTilesetImage(...) and map.createLayer(...)

        this.imageLayer = this.add.image(0, 0, 'world-map-image').setOrigin(0, 0);

        // Size & camera: cover the scene viewport
        this.updateCameraToCover();

        // Build interactive areas from an Object Layer.
        // The map has an object layer called "lobby" with selectable regions
        const objLayer = this.map.getObjectLayer('lobby') || this.map.getObjectLayer('Locations') || this.map.objects?.[0];
        if (objLayer && objLayer.objects?.length) {
            this.createInteractiveHitAreasFromObjects(objLayer.objects);
        } else {
            // If there isn't an object layer yet, nothing breaks – just show the map
            console.warn('WorldMapScene: no "lobby" or "Locations" object layer found in map.tmj');
        }

        // Hover outline
        this.hoverGraphics = this.add.graphics();
        this.input.on('gameout', () => this.hoverGraphics?.clear());

        // Resize handler to keep cover-fit
        this.scale.on('resize', this.updateCameraToCover, this);
    }

    private updateCameraToCover = () => {
        const cam = this.cameras.main;
        const vw = this.scale.width;
        const vh = this.scale.height;

        // world size = image size (fallback to map width/height if image missing)
        const worldW = this.imageLayer?.width ?? this.map.widthInPixels;
        const worldH = this.imageLayer?.height ?? this.map.heightInPixels;

        // Compute cover zoom (no letterboxing)
        const zoom = Math.max(vw / worldW, vh / worldH);
        cam.setBounds(0, 0, worldW, worldH);
        cam.setZoom(zoom);
        cam.centerOn(worldW / 2, worldH / 2);
        cam.setRoundPixels(true);
    };

    private createInteractiveHitAreasFromObjects(objs: any[]) {
        const g = this.add.graphics();

        objs.forEach((o: any) => {
            // We only consider rectangle objects with width/height
            if (o.width > 0 && o.height > 0) {
                const cx = o.x + o.width / 2;
                const cy = o.y + o.height / 2;

                // Phaser hit zone
                const zone = this.add.zone(cx, cy, o.width, o.height)
                    .setOrigin(0.5)
                    .setInteractive({ useHandCursor: true, pixelPerfect: false });

                // Attach the Tiled properties so we can read booleans
                const props: Record<string, any> = {};
                (o.properties || []).forEach((p: any) => {
                    props[p.name] = p.value;
                });

                // Name fallback: use object name or an inferred label
                const name = o.name || Object.keys(props).find(k => props[k] === true) || 'location';

                // Hover outline
                zone.on('pointerover', () => {
                    this.hoverGraphics?.clear();
                    this.hoverGraphics?.lineStyle(2, 0xffffff, 0.9);
                    this.hoverGraphics?.strokeRect(o.x, o.y, o.width, o.height);
                });
                zone.on('pointerout', () => {
                    this.hoverGraphics?.clear();
                });

                // Click selection
                zone.on('pointerdown', () => {
                    // Visual feedback on click
                    this.hoverGraphics?.clear();
                    this.hoverGraphics?.lineStyle(3, 0x00ffcc, 1.0);
                    this.hoverGraphics?.strokeRect(o.x, o.y, o.width, o.height);

                    if (this.onSelectLocation) {
                        this.onSelectLocation({ name, props });
                    }
                });

                this.hitAreas.push(zone);
            }
        });

        // Optional: draw debug boxes once (comment out in prod)
        // g.lineStyle(1, 0xff00ff, 0.3);
        // objs.forEach(o => g.strokeRect(o.x, o.y, o.width, o.height));
        g.destroy(); // not needed after setting up zones
    }

    shutdown() {
        this.scale.off('resize', this.updateCameraToCover, this);
        this.hoverGraphics?.destroy();
        this.hitAreas.forEach(h => h.destroy());
        this.hitAreas = [];
    }

    destroy() {
        this.shutdown();
        super.destroy();
    }
}