interface IBirdEvent {
	Init():void;
	Update(gameSpeed:number):void;
	IsDone():boolean;
}