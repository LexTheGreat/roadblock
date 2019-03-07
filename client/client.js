var speedLimit = 0.0;
var speedLimitRadius = 100.0;

var speedLimitRadiusMax = 100.0;
var speedLimitRadiusMin = 10.0;
var speedLimitRadiusInc = 10.0;

var keyPress = 352; // SHIFT
var keyPressUp = 10; // PAGEUP
var keyPressDown = 11; // PAGEDOWN

var blockedEnt = -1;
var blockedId = -1;
var lastBlockedPos = -1;

setTick(() => {
	var player = GetPlayerPed(-1);
	var vehicle = GetVehiclePedIsIn(player,false);
	if (IsVehicleSirenOn(vehicle) && IsVehicleStopped(vehicle) && GetPedInVehicleSeat(vehicle,-1) == player) {
		if (IsControlJustReleased(0, keyPress)) {
			if (!isBlocked()) {
				blockTraffic(vehicle);
				displayText("Traffic blocked");
			} else {
				unblockTraffic();
				displayText("Roadblock removed");
			}
		}
		
		if (IsControlJustReleased(0, keyPressUp)) {
			displayText("Roadblock Size Up: " + speedLimitRadius);
			
			speedLimitRadius += speedLimitRadiusInc;
			
			if (speedLimitRadius > speedLimitRadiusMax)
				speedLimitRadius = speedLimitRadiusMax;
		}
		
		if (IsControlJustReleased(0, keyPressDown)) {
			displayText("Roadblock Size Down: " + speedLimitRadius);
			
			speedLimitRadius -= speedLimitRadiusInc;
			
			if (speedLimitRadius < speedLimitRadiusMin)
				speedLimitRadius = speedLimitRadiusMin;
			
			if (speedLimitRadius <= 0) // HardMin
				speedLimitRadius = 1.0;
		}
	}
	
	if (isBlocked()) {
		var now = GetEntityCoords(blockedEnt, true);
		if (Math.trunc(now[0]) != Math.trunc(lastBlockedPos[0]) || Math.trunc(now[1]) != Math.trunc(lastBlockedPos[1])) {
			unblockTraffic();
			displayText("Roadblock removed (Car Moved)");
		} else if (!IsVehicleSirenOn(blockedEnt)) {
			unblockTraffic();
			displayText("Roadblock removed (Sirens Off)");
		}
	}
});

function displayText(msg) {
	BeginTextCommandDisplayHelp("STRING");
	AddTextComponentScaleform(msg);
	EndTextCommandDisplayHelp(0, false, true, -1);
}

function isBlocked() {
	return (blockedEnt != -1);
}

function blockTraffic(ent) { // TODO, AddSpeedZoneForCoord is not networked. All client's require it. (Or other client's just break it have to investigate)
	if (isBlocked())
		unblockTraffic();
	
	var entPos = GetEntityCoords(ent, true);
	blockedEnt = ent;
	blockedId = AddSpeedZoneForCoord(entPos[0], entPos[1], entPos[2], speedLimitRadius, speedLimit, false);
	lastBlockedPos = entPos;
	console.log("SpeedZone Added");
}

function unblockTraffic() {
	if (blockedEnt == -1)
		return;
	
	RemoveSpeedZone(blockedId);
	console.log("SpeedZone Removed");
	blockedEnt = -1;
	blockedId = -1;
	lastBlockedPos = -1;
}