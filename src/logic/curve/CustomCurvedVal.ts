class CustomCurvedVal extends BaseCurvedVal
{
	public static FLAG_NOCLIP:number = 1;
	public static CV_NUM_SPLINE_POnumberS:number = 0x2000;//8192
	public static FLAG_HERMITE:number = 8;

	private mIsClipped:boolean;// = false
	private mIsHermite:boolean;// = true
	private mRecord:CurvedValRecord;

	public constructor() 
	{
		super();
	}

	private  generateTable():number[]
	{
		return [];
	}
	
	public  getOutValue(inVal:number):number
	{
		let anOutVal:number;
		if (this.mRecord == null){
			return (0);
		};
		if ((this.mInMax - this.mInMin) == 0){
			return (0);
		};
		let aCheckInVal:number = Math.min(((inVal - this.mInMin) / (this.mInMax - this.mInMin)), 1);
		if (this.mIsHermite){
			anOutVal = (this.mOutMin + (this.mRecord.hermite.evaluate(aCheckInVal) * (this.mOutMax - this.mOutMin)));
			if (this.mIsClipped){
				if (this.mOutMin < this.mOutMax){
					anOutVal = Math.min(Math.max(anOutVal, this.mOutMin), this.mOutMax);
				} else {
					anOutVal = Math.max(Math.min(anOutVal, this.mOutMin), this.mOutMax);
				};
			};
			return (anOutVal);
		};
		let table:number[] = this.mRecord.table;
		let aGX:number = (aCheckInVal * (CustomCurvedVal.CV_NUM_SPLINE_POnumberS - 1));
		let aLeft:number = (aGX);
		if (aLeft == (CustomCurvedVal.CV_NUM_SPLINE_POnumberS - 1)){
			return ((this.mOutMin + (table[aLeft] * (this.mOutMax - this.mOutMin))));
		};
		let aFrac:number = (aGX - aLeft);
		anOutVal = this.mOutMin;
		anOutVal = (anOutVal + ((table[aLeft] * (1 - aFrac)) + (table[(aLeft + 1)] * aFrac)));//为了更精确做了插值
		anOutVal = (anOutVal * (this.mOutMax - this.mOutMin));
		return (anOutVal);
	}
	
	public  setCurve(isHermite:boolean, ... _args):void
	{
		this.mIsHermite = isHermite;
		let p:CurvedValPoint;
		let slope:number;
		let hp:HermitePoint;
		this.mRecord = new CurvedValRecord();
		this.mRecord.table = this.generateTable();
		this.mRecord.hermite.ponumbers.length = 0;
		let numPonumbers:number = _args.length;
		let i:number;
		while (i < numPonumbers) {
			p = _args[i];
			slope = Math.tan(((p.angleDegrees / 180) * Math.PI));
			hp = new HermitePoint();
			hp.x = p.x;
			hp.fx = p.y;
			hp.fxp = slope;
			this.mRecord.hermite.ponumbers.push(hp);
			i++;
		};
		this.mRecord.hermite.rebuild();
	}
}