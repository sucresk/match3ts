class MoveData 
{
	public swapPos:egret.Point;
	public hypersMade:number;
	public starsUsed:number;
	public largetstMatch:number;
	public time:number;
	public birdsCleared:number;
	public isActivie:Boolean;
	public flamesMade:number;
	public starsMade:number;
	public id:number;
	public isSwap:Boolean;
	public isSuccessful:Boolean;
	public hypersUsed:number;
	public sourcePos:egret.Point;
	public swapDir:egret.Point;
	public sourceBird:Tile;
	public swapBird:Tile;
	public flamesUsed:number;
	public cascdes:number;

	public constructor() 
	{
		this.sourcePos = new egret.Point();
		this.swapDir = new egret.Point();
		this.swapPos = new egret.Point();
	}
}