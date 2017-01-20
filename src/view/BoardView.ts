class BoardView extends egret.DisplayObjectContainer
{
	private _board:Board;
	private _tileViews:TileView[];

	public constructor() 
	{
		super();
		this._tileViews = [];

	}

	public set board(v:Board)
	{
		this._board = v;
		for(let i:number = 0; i < this._board.numBirds; i++)
		{
			var t:TileView = new TileView();
			this.addChild(t);
			this._tileViews.push(t);
		}

		this.refresh();
	}

	public get board():Board
	{
		return this._board;
	}

	public refresh():void
	{
		for(let i:number = 0; i < this._board.numBirds; i++)
		{
			this._tileViews[i].tile = this._board.mBirds[i];
		}
	}

}