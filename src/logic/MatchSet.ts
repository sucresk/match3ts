class MatchSet 
{
	public mBirds:Tile[];
	public mMatches:Match[];

	public constructor() 
	{
		this.mBirds = [];
		this.mMatches = [];
	}

	public get isDeferred():boolean
	{
		let bird:Tile;
		let numBirds:number = this.mBirds.length;
		for (let i:number = 0; i < numBirds; i++)
		{
			bird = this.mBirds[i];
			if (bird.mIsFalling)
				return true;
		}
		return false;
	}
	
	public resolve():void
	{
		let match:Match;
		let birds:Tile[];
		let numBirds:number;
		let bird:Tile;
		let index:number;
		this.mBirds.length = 0;
		let aNumMatches:number = this.mMatches.length;
		for (let i:number = 0; i < aNumMatches; i++)
		{
			match = this.mMatches[i];
			birds = match.mBirds;
			numBirds = birds.length;
			for (let k:number = 0; k < numBirds; k++)
			{
				bird = birds[k];
				index = this.mBirds.indexOf(bird);
				if (index < 0)
					this.mBirds.push(bird);
			}
		}
		
	}
}