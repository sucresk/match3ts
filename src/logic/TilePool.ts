class TilePool 
{
	public constructor() 
	{
	}

	public allocTile():Tile
	{
		var bird:Tile = new Tile();
		bird.mType = Tile.TYPE_STANDARD;
		return bird;
	}
	
	public unallocTile(bird:Tile):void
	{
		
	}
}