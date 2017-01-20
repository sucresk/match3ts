class TileView extends egret.Sprite
{
	public static SIZE:number = 24;
	public static COLORS:number[]= [0,0x00ff00,0x0000ff,0xffff00,0xff00ff,0x00ffff,0xf00000,0x00f000,0x0000f0]
	private _tile:Tile;

	public constructor() 
	{
		super();
	}

	public set tile(v:Tile)
	{
		this._tile = v;
		this.draw();
	}
	public get tile():Tile
	{
		return this._tile;
	}
	private draw():void
	{
		if(this._tile)
		{
			this.graphics.beginFill(TileView.COLORS[this._tile.mColor]);
			this.graphics.drawRect(0,0,TileView.SIZE - 2,TileView.SIZE - 2);
			this.x = this._tile.mX * 2 * TileView.SIZE;
			this.y = (-this._tile.mY) * TileView.SIZE;
		}
	}
}