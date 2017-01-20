class Random 
{
	private mPointer:number;
	private mIsSeedValid:boolean
	private mSeed:number;
	private mTexture:egret.Texture;

	public constructor(seed:number = 0,texture:egret.Texture) 
	{
		this.mSeed = seed;
		this.mTexture = texture;
	}

	public set seed(value:number)
	{
		if (value != this.mSeed)
		{
			this.mIsSeedValid = false;
			this.mPointer = 0;
		}
		this.mSeed = value;
	}
	
	public get seed():number
	{
		return this.mSeed;
	}
	
	public set pointer(value:number)
	{
		this.mPointer = value;
	}
	
	public get pointer():number
	{
		return this.mPointer;
	}
	
	public Float(min:number, max:number = NaN):number
	{
		if (isNaN(max))
		{
			max = min;
			min = 0;
		}
		return this.Next() * (max - min) + min;
	}
	
	public Int(min:number, max:number = NaN):number
	{
		if (isNaN(max))
		{
			max = min;
			min = 0;
		}
		return Math.floor(this.Float(min, max));
	}
	public Sign(chance:number = 0.5):number
	{
		return this.Next() < chance ? 1 : -1;
	}
	
	public Reset():void
	{
		this.mPointer = 0;
	}
	
	public Bool(chance:number = 0.5):boolean
	{
		return this.Next() < chance;
	}
	
	public Bit(chance:number = 0.5, shift:number = 0):number
	{
		return this.Next() < chance ? (1 << shift) : 0;
	}
	
	public Next():number
	{
		if (this.mIsSeedValid == false)
		{
			this.mIsSeedValid = true;
		}
		this.mPointer = (this.mPointer + this.mSeed + 1) % 200000;
		let realX:number = this.mPointer % 1000;
		let realY:number = (this.mPointer / 1000) >> 0;
		let colors:number[] = this.mTexture.getPixels(realX,realY,1,1);
		let realC:number = 0x1 * colors[0] + 0x100 * colors[1] + 0x10000 * colors[2];//+ 0x1000000 * colors[3];
		//console.log(colors, realC, 0xffffff);
		// return (realC * 0.999999999999998 + 1E-15) / 16777215;//4294967295;
		return (realC) / 16777215;//4294967295;
	}
}