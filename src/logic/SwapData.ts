class SwapData 
{
	public static SWAP_TIME:number = 30;
    public static BAD_SWAP_TIME:number = 45;

	public moveData:MoveData;
	public isBadSwap:boolean;// = false
	public board:Board;// = null
	public isForwardSwap:boolean;// = true
	public speedFactor:number;// = 1

	private mForeScale:CustomCurvedVal;
	private mSwapPercent:ICurvedVal;
	private mFlip:boolean;// = false
	private mTimeTotal:number;// = 30
	private mGem1Row:number;// = 0
	private mGem2Col:number;// = 0
	private mIsDone:boolean;// = false
	private mHack:boolean;// = false
	private mGem1Col:number;// = 0
	private mBackScale:CustomCurvedVal;
	private mBackPercent:CustomCurvedVal;
	private mForePercent:CustomCurvedVal;
	private mGemScale:ICurvedVal;
	private mTime:number;// = 0
	private mSwapCenterX:number;// = 0
	private mSwapCenterY:number;// = 0
	private mGem2Row:number;// = 0
	private mDead:boolean;// = false

	public constructor() 
	{
		this.mForePercent = new CustomCurvedVal();
		this.mForePercent.setInRange(0, 1);
		this.mForePercent.setOutRange(0, 1);
		this.mForePercent.setCurve(true, new CurvedValPoint(0, 1, 0), new CurvedValPoint(1, 0, 0));
		this.mBackPercent = new CustomCurvedVal();
		this.mBackPercent.setInRange(0, 1);
		this.mBackPercent.setOutRange(0, 1);
		this.mBackPercent.setCurve(true, new CurvedValPoint(0, 1, 0), new CurvedValPoint(1, 0, 0));
		this.mForeScale = new CustomCurvedVal();
		this.mForeScale.setInRange(0, 1);
		this.mForeScale.setOutRange(0, 0.25);
		this.mForeScale.setCurve(true, new CurvedValPoint(0, 0, 0), new CurvedValPoint(0.5, 0.25, 0), new CurvedValPoint(1, 0, 0));
		this.mBackScale = new CustomCurvedVal();
		this.mBackScale.setInRange(0, 1);
		this.mBackScale.setOutRange(0, 0.25);
		this.mBackScale.setCurve(true, new CurvedValPoint(0, 0, 0), new CurvedValPoint(0.5, 0.25, 0), new CurvedValPoint(1, 0, 0));
		this.mSwapPercent = this.mForePercent;
		this.mGemScale = this.mForeScale;
		this.Reset();
	}

	public init():void{
		let gem1:Tile = this.moveData.sourceBird;
		let gem2:Tile = this.moveData.swapBird;
		this.mSwapCenterX = (gem1.mCol + (this.moveData.swapDir.x * 0.5));
		this.mSwapCenterY = (gem1.mRow + (this.moveData.swapDir.y * 0.5));
		this.mGem1Row = gem1.mRow;
		this.mGem1Col = gem1.mCol;
		this.mGem2Row = gem2.mRow;
		this.mGem2Col = gem2.mCol;
	}
	public Reset():void{
		this.board = null;
		this.moveData = null;
		this.speedFactor = 1;
		this.isForwardSwap = true;
		this.isBadSwap = false;
		this.mIsDone = false;
		this.mTime = 0;
		this.mTimeTotal = SwapData.SWAP_TIME;
		this.mSwapPercent = this.mForePercent;
		this.mGemScale = this.mForeScale;
	}
	public draw(canvas:egret.BitmapData):void{
	}
	public update():void
	{
		if (this.mIsDone == true){
			return;
		};
		this.isBadSwap = false;
		this.mTime = (this.mTime + this.speedFactor);
		if (this.mTime > this.mTimeTotal){
			this.mTime = this.mTimeTotal;
		};
		let time:number = (this.mTime / this.mTimeTotal);
		let gem1:Tile = this.moveData.sourceBird;
		let gem2:Tile = this.moveData.swapBird;
		if (((!(this.mDead)) && (((gem1.isDead) || (((!((gem2 == null))) && (gem2.isDead))))))){
			this.mIsDone = true;
			gem1.isDead = true;
			gem2.isDead = true;
			return;
		};
		if (!this.isForwardSwap){
			time = (1 - time);
		};
		let percent:number = this.mSwapPercent.getOutValue(time);
		let progress:number = ((percent * 2) - 1);
		let swapDir:egret.Point = this.moveData.swapDir;
		gem1.mX = (this.mSwapCenterX - ((progress * swapDir.x) * 0.5));
		gem1.mY = (this.mSwapCenterY - ((progress * swapDir.y) * 0.5));
		gem1.mScale = (1 + this.mGemScale.getOutValue(percent));
		if (gem2 != null){
			gem2.mX = (this.mSwapCenterX + ((progress * swapDir.x) * 0.5));
			gem2.mY = (this.mSwapCenterY + ((progress * swapDir.y) * 0.5));
			gem2.mScale = (1 - this.mGemScale.getOutValue(percent));
		};
		if (this.mTime == this.mTimeTotal){
			if (this.isForwardSwap){
				gem1.mIsSwapping = false;
				gem2.mIsSwapping = false;
				this.board.swapBirds(gem1, gem2);
				this.board.findMatches();
				if (this.mDead){
					this.mIsDone = true;
				} else {
					console.log("swapData: ", gem1.mHasMatch, " " ,gem2.mHasMatch);
					if (((gem1.mHasMatch) || (gem2.mHasMatch))){
						this.mIsDone = true;
						this.moveData.isSuccessful = true;
					} else {
						this.board.swapBirds(gem1, gem2);
						this.mSwapPercent = this.mBackPercent;
						this.mGemScale = this.mBackScale;
						this.mTime = 0;
						this.mTimeTotal = SwapData.BAD_SWAP_TIME;
						this.isForwardSwap = false;
						this.isBadSwap = true;
					};
				};
			} else {
				this.mIsDone = true;
			};
		};
		gem1.mIsSwapping = !(this.mIsDone);
		gem2.mIsSwapping = !(this.mIsDone);
	}
	public isDone():boolean{
		return (this.mIsDone);
	}
}