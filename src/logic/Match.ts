class Match 
{
	public mCascadeId:number;
	public mX:number;
	public mY:number;
	public mBirds:Tile[];
	public mMatchId:number;
	public mLeft:number;
	public mRight:number;
	public mTop:number;
	public mBottom:number;
	public mOverlaps:Match[];
	public mDeferred:boolean;
	public mSet:MatchSet;

	public constructor() 
	{
		this.mOverlaps = [];
	}

	public init(birds:Tile[]):void
	{
		let bird:Tile;
		let row:number;
		let col:number;
		this.mBirds = birds;
		this.mLeft = Board.BOARD_WIDTH;
		this.mRight = -1;
		this.mTop = Board.BOARD_HEIGHT;
		this.mBottom = -1;
		let numBirds:number = this.mBirds.length;
		let i:number = 0;
		for (i = 0; i < numBirds; i++)
		{
			bird = this.mBirds[i];
			row = bird.mRow;
			col = bird.mCol;
			this.mLeft = col < this.mLeft ? col : this.mLeft;
			this.mRight = col > this.mRight ? col : this.mRight;
			this.mTop = row < this.mTop ? row : this.mTop;
			this.mBottom = row > this.mBottom ? row : this.mBottom;
			bird.mHasMatch = true;
			this.mCascadeId = bird.moveId > this.mCascadeId ? bird.moveId : this.mCascadeId;
		}
		for (i = 0; i < numBirds; i++)
		{
			bird = this.mBirds[i];
			bird.moveId = this.mCascadeId;
		}
		this.mOverlaps.length = 0;
		this.mX = this.mLeft + (this.mRight - this.mLeft) / 2;
		this.mY =this. mTop + (this.mBottom - this.mTop) / 2;
	}
	
	public isOverlapping(other:Match):boolean
	{
		if (this.mLeft > other.mRight)
			return false;
		if (this.mRight < other.mLeft)
			return false;
		if (this.mTop > other.mBottom)
			return false;
		if (this.mBottom < other.mTop)
			return false;
			
		return true;
	}
	
	public toString():string
	{
		var str:string = "( ";
		for (let i:number = 0; i < this.mBirds.length; i++)
		{
			str += this.mBirds[i] + " ";
		}
		str += ")";
		return str;
	}
}