
var game_file_list = [
    //以下为自动修改，请勿修改
    //----auto game_file_list start----
	"libs/modules/egret/egret.js",
	"libs/modules/egret/egret.native.js",
	"libs/modules/game/game.js",
	"libs/modules/game/game.native.js",
	"libs/modules/res/res.js",
	"libs/modules/tween/tween.js",
	"bin-debug/logic/curve/BaseCurvedVal.js",
	"bin-debug/LoadingUI.js",
	"bin-debug/Match3Game.js",
	"bin-debug/logic/Board.js",
	"bin-debug/logic/Match.js",
	"bin-debug/logic/Match3Logic.js",
	"bin-debug/logic/MatchSet.js",
	"bin-debug/logic/Matcher.js",
	"bin-debug/logic/MoveData.js",
	"bin-debug/logic/MovePool.js",
	"bin-debug/logic/SwapData.js",
	"bin-debug/logic/Tile.js",
	"bin-debug/logic/TileGrid.js",
	"bin-debug/logic/TilePool.js",
	"bin-debug/Main.js",
	"bin-debug/logic/curve/CurvedValPoint.js",
	"bin-debug/logic/curve/CurvedValRecord.js",
	"bin-debug/logic/curve/CustomCurvedVal.js",
	"bin-debug/logic/curve/ICurvedVal.js",
	"bin-debug/logic/events/IBirdEvent.js",
	"bin-debug/logic/events/MatchEvent.js",
	"bin-debug/logic/events/ShatterEvent.js",
	"bin-debug/math/Hermite.js",
	"bin-debug/math/HermitePiece.js",
	"bin-debug/math/HermitePoint.js",
	"bin-debug/math/Random.js",
	"bin-debug/view/BoardView.js",
	"bin-debug/view/TileView.js",
	//----auto game_file_list end----
];

var window = this;

egret_native.setSearchPaths([""]);

egret_native.requireFiles = function () {
    for (var key in game_file_list) {
        var src = game_file_list[key];
        require(src);
    }
};

egret_native.egretInit = function () {
    if(egret_native.featureEnable) {
        //控制一些优化方案是否开启
        var result = egret_native.featureEnable({
            
        });
    }
    egret_native.requireFiles();
    //egret.dom为空实现
    egret.dom = {};
    egret.dom.drawAsCanvas = function () {
    };
};

egret_native.egretStart = function () {
    var option = {
        //以下为自动修改，请勿修改
        //----auto option start----
		entryClassName: "Main",
		frameRate: 60,
		scaleMode: "showAll",
		contentWidth: 640,
		contentHeight: 1136,
		showPaintRect: false,
		showFPS: true,
		fpsStyles: "x:0,y:0,size:48,textColor:0xffffff,bgAlpha:0.9",
		showLog: true,
		logFilter: "",
		maxTouches: 2,
		textureScaleFactor: 1
		//----auto option end----
    };

    egret.native.NativePlayer.option = option;
    egret.runEgret();
    egret_native.Label.createLabel("/system/fonts/DroidSansFallback.ttf", 20, "", 0);
    egret_native.EGTView.preSetOffScreenBufferEnable(true);
};