interface ICurvedVal 
{
	getOutValue(inVal:number):number;
	setOutRange(min:number, max:number):void;
	setInRange(min:number, max:number):void;
}