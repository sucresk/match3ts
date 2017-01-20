class Match3Game extends egret.DisplayObjectContainer
{
	public logic:Match3Logic;
	private _boardView:BoardView;

	public constructor() 
	{
		super();
		this.addEventListener(egret.Event.ADDED_TO_STAGE, this.onAdded,this);
	}

	private onAdded(e:egret.Event):void
	{
		this.removeEventListener(egret.Event.ADDED_TO_STAGE, this.onAdded,this);
		this.init();
	}

	private init():void
	{
		Match3Logic.RANDOM_SEED = 234;
		this.logic = new Match3Logic();
		this._boardView = new BoardView();
		this._boardView.board = this.logic.board;
		this.addChild(this._boardView);
		// egret.startTick(this.tick,this);
		
	}

	private tick(timeStamp:number):boolean
	{
		//this.logic.update();
		console.log(timeStamp);
		return false;
	}
}