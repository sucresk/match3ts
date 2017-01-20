class TileGrid 
{
	private mCols:number;// = 0
	private mRows:number;// = 0
	private mGrid:Tile[][];
	private mNumGems:number;// = 0

	public constructor(rows:number, cols:number) 
	{
		this.mRows = rows;
		this.mCols = cols;
		this.mNumGems = rows * cols;
		this.mGrid = [];
		let row:number;
		while (row < rows)
		{
			this.mGrid[row] = [];
			row++;
		};
		this.Reset();
	}
	public  clearGrid():void
	{
		let col:number = 0;
		let row:number = 0;
		while (row < this.mRows) 
		{
			col = 0;
			while (col < this.mCols) 
			{
				this.mGrid[row][col] = null;
				col++;
			};
			row++;
		};
	}
	
	public  getArea(row:number, col:number, range:number):Tile[]
	{
		let c:number;
		let gems:Tile[] = [];
		let left:number = (col - range);
		let right:number = (col + range);
		let top:number = (row - range);
		let bottom:number = (row + range);
		let bl:number;
		let br:number = (this.mCols - 1);
		let bt:number;
		let bb:number = (this.mRows - 1);
		left = left > bl ? left : bl;
		right = right < br ? right : br;
		top = top > bt ? top : bt;
		bottom = bottom < bb ? bottom : bb;
		let r:number = top;
		while (r <= bottom) 
		{
			c = left;
			while (c <= right) 
			{
				gems.push(this.getBird(r, c));
				c++;
			};
			r++;
		};
		return gems;
	}
	
	public  getCross(row:number, col:number, range:number, includeLocus:boolean = false):Tile[]
	{
		let gems:Tile[] = [];
		let left:number = col - range;
		let right:number = col + range;
		let top:number = row - range;
		let bottom:number = row + range;
		let bl:number;
		let br:number = this.mCols - 1;
		let bt:number;
		let bb:number = this.mRows - 1;
		left = left > bl ? left : bl;
		right = right < br ? right : br;
		top = top > bt ? top : bt;
		bottom = bottom < bb ? bottom : bb;
		let gem:Tile;
		if (includeLocus){
			gems.push(this.getBird(row, col));
		};
		let r:number = top;
		while (r <= bottom) 
		{
			if (r == row)
			{
				
			} 
			else 
			{
				gems.push(this.getBird(r, col));
			}
			r++;
		}
		let c:number = left;
		while (c <= right) 
		{
			if (c == col)
			{
				
			} 
			else 
			{
				gems.push(this.getBird(row, c));
			}
			c++;
		}
		return gems;
	}
	
	public  getCols():number
	{
		return this.mCols;
	}
	
	public  getRows():number
	{
		return this.mRows;
	}
	
	public  getNumGems():number
	{
		return this.mNumGems;
	}
	
	public  Reset():void
	{
		let row:Tile[];
		let c:number;
		let r:number;
		while (r < this.mGrid.length) 
		{
			row = this.mGrid[r];
			c = 0;
			while (c < row.length) 
			{
				row[c] = null;
				c++;
			};
			r++;
		};
	}
	
	public  getBird(row:number, col:number):Tile
	{
		if (row < 0 || col < 0 || row >= this.mRows || col >= this.mCols)
		{
			return null;
		};
		return this.mGrid[row][col];
	}
	
	public  setBird(row:number, col:number, gem:Tile):void
	{
		if (row < 0 || col < 0 || row >= this.mRows || col >= this.mCols)
		{
			return;
		}
		this.mGrid[row][col] = gem;
	}
}