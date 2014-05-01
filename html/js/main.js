$(document).ready(function()
{
	addToHomescreen(
	{
		skipFirstVisit: false,	// show at first access
		startDelay: 0,          // display the message right away
		lifespan: 0,            // do not automatically kill the call out
		displayPace: 60,        // do not obey the display pace
		maxDisplayCount: 1      // do not obey the max display count
	});
	initApp();
});

var mCanvas;
var mCtx;

/* Grid */
var mShowGrid = true;
var mRedrawRequested = true;
var mGridWidth = 30;
var mGridHeight = 20;
var mPixelSize = 20;
var mSpacing = 2;

var mRefreshInterval = 1.0;
var mRefreshTimer;
var mIndex;
var mLines;

//data
var mCurrentGridData;
var mCurrentTime;

var colorPalette = ["rgb(255,0,0)","rgb(0,255,0)","rgb(0,0,255)"];

/* Function definitions */
var fnUpdate = function()
{
    mRefreshTimer += mTime.DeltaTime();
	if( mRefreshTimer > mRefreshInterval)
	{
		mRefreshTimer -= mRefreshInterval;
		if( mLines == null ||  (mLines != null && mIndex == mLines.length - 2) )
		{
			getData(-1);
		}
	}
};

function drawGrid()
{
	for (var x=0;x<mGridWidth;++x)
    {
        for (var y=0;y<mGridHeight;++y)
        {
            // Find the starting index in the one-dimensional image data (we flip y)
            var i = (mGridHeight - y - 1) * mGridWidth + x;
            var colorIndex = parseInt(mCurrentGridData.substring(i,i+1));
            mCtx.fillStyle = colorPalette[colorIndex];
            mCtx.fillRect( x*mPixelSize - mSpacing / 2, y*mPixelSize - mSpacing / 2, mPixelSize - mSpacing, mPixelSize - mSpacing);
        }
    }
	$("#info").text(mCurrentTime);
}

function initApp()
{
	/* Size The Canvas */
	$("#canvas").attr("width", mGridWidth*mPixelSize+"px");
	$("#canvas").attr("height", mGridHeight*mPixelSize+"px");
	mCanvas = document.getElementById("canvas");
	mCtx = mCanvas.getContext("2d");
	
	/* Init time manager */
	mTime = new Time();
	mRefreshTimer = 0.0;
	
	getData(-1);
	
	/* keyboard */
	document.addEventListener('keydown', function(event)
	{
		//LEFT
		if(event.keyCode == 37) { showPrev();}
		//RIGHT
		else if(event.keyCode == 39){ showNext(); }
	});

	/* Start the main loop */
	tick();
}

/* Main Timing Loop */
function tick()
{
    requestAnimFrame(tick);
	mTime.Tick();
	fnUpdate();
}

function getData(index)
{
	mIndex = index;
	if(mIndex == -1 )
	{
		$.get('pixeldata.txt', function(data)
		{
			mLines = data.split("\n");
			tryUpdateGrid();
		}, 'text');
	}
	else
	{
		tryUpdateGrid();
	}
}

function tryUpdateGrid()
{
	if(mIndex == -1 || mIndex > mLines.length - 2) mIndex = mLines.length - 2;
	var line = mLines[mIndex];
	var lineContents = line.split("|");
	mCurrentTime = lineContents[0];
	
	if(mCurrentGridData != lineContents[1])
	{
	  mCurrentGridData = lineContents[1];
	  drawGrid();
	}
}

function showNext() { getData(mIndex+1); }
function showPrev() { getData(mIndex-1); }