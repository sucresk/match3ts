class CurvedValRecord 
{
	public hermite:Hermite;
	public table:number[];

	public constructor()
	{
		this.table = [];
		this.hermite = new Hermite();
	}
}