class Hermite 
{
	public static NUM_DIMS:number = 4;

	public ponumbers:HermitePoint[];
	private mIsBuilt:boolean;// = false
	private q:number[][];
	private mPieces:HermitePiece[];
	private mXSub:number[];
	private z:number[];

	public constructor() 
	{
		this.ponumbers = [];
		this.mPieces = [];
		this.mXSub = [];
		this.q = [];//]NUM_DIMS;
		let i:number;
		while (i < Hermite.NUM_DIMS) 
		{
			this.q[i] = [];//NUM_DIMS;
			i++;
		};
		this.z = [];//NUM_DIMS;
	}

	private  createPiece(offset:number):HermitePiece{
		let p:HermitePoint;
		let i2:number;
		let j:number;
		let i:number;
		while (i <= 1) {
			p = this.ponumbers[(offset + i)];
			i2 = (2 * i);
			this.z[i2] = p.x;
			this.z[(i2 + 1)] = p.x;
			this.q[i2][0] = p.fx;
			this.q[(i2 + 1)][0] = p.fx;
			this.q[(i2 + 1)][1] = p.fxp;
			if (i > 0){
				this.q[i2][1] = ((this.q[i2][0] - this.q[(i2 - 1)][0]) / (this.z[i2] - this.z[(i2 - 1)]));
			};
			i++;
		};
		i = 2;
		while (i < Hermite.NUM_DIMS) {
			j = 2;
			while (j <= i) {
				this.q[i][j] = ((this.q[i][(j - 1)] - this.q[(i - 1)][(j - 1)]) / (this.z[i] - this.z[(i - j)]));
				j++;
			};
			i++;
		};
		let piece:HermitePiece = new HermitePiece();
		i = 0;
		while (i < Hermite.NUM_DIMS) {
			piece.coeffs[i] = this.q[i][i];
			i++;
		};
		return (piece);
	}
	public  evaluate(inX:number):number{
		let ponumberA:HermitePoint;
		let ponumberB:HermitePoint;
		let piece:HermitePiece;
		if (!this.mIsBuilt){
			if (!this.build()){
				return (0);
			};
			this.mIsBuilt = true;
		};
		let numPieces:number = this.mPieces.length;
		let i:number;
		while (i < numPieces) {
			if (inX < this.ponumbers[(i + 1)].x){
				ponumberA = this.ponumbers[i];
				ponumberB = this.ponumbers[(i + 1)];
				piece = this.mPieces[i];
				return (this.evaluatePiece(inX, ponumberA.x, ponumberB.x, piece));
			};
			i++;
		};
		return (this.ponumbers[(this.ponumbers.length - 1)].fx);
	}
	public  rebuild():void{
		this.mIsBuilt = false;
	}
	private  evaluatePiece(inX:number, x0:number, x1:number, piece:HermitePiece):number{
		this.mXSub[0] = (inX - x0);
		this.mXSub[1] = (inX - x1);
		let f:number = 1;
		let h:number = piece.coeffs[0];
		let i:number = 1;
		while (i < Hermite.NUM_DIMS) {
			f = (f * this.mXSub[((i - 1) / 2)]);
			h = (h + (f * piece.coeffs[i]));
			i++;
		};
		return (h);
	}
	private  build():boolean{
		this.mPieces.length = 0;
		let numPonumbers:number = this.ponumbers.length;
		if (numPonumbers < 2){
			return (false);
		};
		let numPieces:number = (numPonumbers - 1);
		let i:number;
		while (i < numPieces) {
			this.mPieces[i] = this.createPiece(i);
			i++;
		};
		return (true);
	}	
}