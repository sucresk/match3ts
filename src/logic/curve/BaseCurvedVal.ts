class BaseCurvedVal implements ICurvedVal
{
	protected mInMax:number;
	protected mInMin:number;
	protected mOutMax:number;
	protected mOutMin:number;

	public constructor() 
	{

	}

	public getOutValue(inVal:number):number 
	{
		return this.mOutMax;
	}
	
	public setOutRange(min:number, max:number):void 
	{
		this.mOutMin = min;
		this.mOutMax = max;
	}
	
	public setInRange(min:number, max:number):void 
	{
		this.mInMax = max;
		this.mInMin = min;
	}
}