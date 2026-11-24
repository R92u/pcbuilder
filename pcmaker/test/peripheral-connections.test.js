import test from 'node:test';
import assert from 'node:assert/strict';
import {peripherals,peripheralById} from '../dist/peripherals-brands.js';
import {byId} from '../dist/catalog.js';
import {connectorType,connectionModes,bluetoothSupport,connectionError,sanitizeConnections,safeWaypoints,routeError,defaultWaypoints,supportedPoints,DESK_Y,DESK_MAT,WIRE_RADIUS,ROUTE_Y} from '../dist/peripheral-connections.js';
const keyboard=peripheralById.fizz,mouse=peripheralById.griffin,monitor=peripheralById.a27i;
const usb={id:'motherboard:0',part:'motherboard',type:'usbA'},hdmi={id:'gpu:0',part:'gpu',type:'hdmi'};
const pc={motherboard:byId.b650,cpu:byId['r5-7600'],gpu:byId.rtx4060};
test('All electronic peripherals expose at least one documented connection; battery mice do not grow USB cables',()=>{
 for(const p of peripherals.filter(p=>!['chair','mat'].includes(p.category)))assert.ok(connectionModes(p).length,p.id);
 for(const id of ['logitech-g309-lightspeed-gaming-mouse','razer-rz01-03730100-r3a1','razer-rz01-04130100-r3c1'])assert.deepEqual(connectionModes(peripheralById[id]),['receiver','bluetooth']);
 assert.deepEqual(connectionModes(peripheralById.anubis),['usb','receiver','bluetooth']);
 assert.deepEqual(connectionModes(peripheralById['storm-pro']),['usb','receiver']);
});
test('Video types, USB-C and legacy DVI stay distinct',()=>{
 assert.deepEqual(['HDMI','DisplayPort','DP','DVI','VGA','usb2','USB-C','wifi'].map(connectorType),['hdmi','dp','dp','dvi','vga','usbA','usbC',null]);
 assert.ok(connectionError(monitor,'hdmi',{...hdmi,type:'dp'},{},'monitor',pc));
 assert.ok(connectionError(keyboard,'usb',{...usb,type:'usbC'},{},'keyboard',pc));
 assert.equal(connectionError(monitor,'hdmi',hdmi,{},'monitor',pc),'');
});
test('Occupied USB ports are rejected while reconnecting the same device is permitted',()=>{
 const connections={keyboard:{port:usb.id}};
 assert.ok(connectionError(mouse,'usb',usb,connections,'mouse',pc));
 assert.equal(connectionError(keyboard,'usb',usb,connections,'keyboard',pc),'');
});
test('Motherboard video needs an explicitly supported iGPU, GPU video does not',()=>{
 const output={...hdmi,part:'motherboard'},noIGPU={...pc,cpu:byId['r5-4500']};
 assert.ok(connectionError(monitor,'hdmi',output,{},'monitor',noIGPU));
 assert.equal(connectionError(monitor,'hdmi',output,{},'monitor',pc),'');
 assert.equal(connectionError(monitor,'hdmi',hdmi,{},'monitor',noIGPU),'');
});
test('Bluetooth requires evidence and consumes no USB port',()=>{
 assert.equal(bluetoothSupport(byId.b650),true);assert.equal(bluetoothSupport(byId['a520m-a-pro']),false);assert.equal(bluetoothSupport({id:'unknown',wifi:true}),null);
 assert.ok(connectionError(peripheralById.king,'bluetooth',null,{},'mouse',{motherboard:byId['a520m-a-pro']}));
 assert.equal(connectionError(peripheralById.king,'bluetooth',null,{keyboard:{port:usb.id}},'mouse',pc),'');
 assert.ok(connectionError(mouse,'bluetooth',null,{},'mouse',pc));
});
test('Saved connections invalidate on device/board/GPU replacement and resolve duplicate ports deterministically',()=>{
 const products={keyboard,mouse,monitor},connections={keyboard:{product:keyboard.id,mode:'usb',port:usb.id,hardware:'b650',points:[[1,99,2]]},mouse:{product:mouse.id,mode:'usb',port:usb.id,hardware:'b650'},monitor:{product:monitor.id,mode:'hdmi',port:hdmi.id,hardware:'rtx4060'}};
 const cleaned=sanitizeConnections(connections,products,[usb,hdmi],pc);assert.deepEqual(Object.keys(cleaned),['monitor','keyboard']);assert.equal(cleaned.keyboard.points[0][1],ROUTE_Y);
 assert.equal(sanitizeConnections(connections,products,[usb,hdmi],{...pc,motherboard:byId.b550}).keyboard,undefined);
 assert.equal(sanitizeConnections(connections,products,[usb,hdmi],{...pc,gpu:byId.rtx3090}).monitor,undefined);
 assert.equal(sanitizeConnections(connections,{...products,keyboard:peripheralById.ryze},[usb,hdmi],pc).keyboard,undefined);
});
test('Route points are bounded and line segments cannot tunnel through a case',()=>{
 assert.deepEqual(safeWaypoints([[Infinity,0,1],[99,88,-99],null]),[[8.7,ROUTE_Y,-3.7]]);
 const obstacle={minX:3,maxX:7,minZ:-1.7,maxZ:.5};
 assert.ok(routeError([[1,ROUTE_Y,0],[8,ROUTE_Y,0]],obstacle));
 assert.equal(routeError([[1,ROUTE_Y,-3],[8,ROUTE_Y,-3],[8,ROUTE_Y,0]],obstacle),'');
 assert.ok(routeError([[9,ROUTE_Y,0]],obstacle));
 const stand={minX:-3.52,maxX:-.28,minZ:-2.78,maxZ:-.12};
 const entry=[-1.9,ROUTE_Y,.6],exit=[8.58,ROUTE_Y,.2];
 const boxes=[obstacle,stand],points=defaultWaypoints(entry,exit,boxes);
 assert.ok(points?.length);assert.equal(routeError([entry,...points,exit],boxes),'');
 assert.ok(routeError([entry,[-1.9,ROUTE_Y,-3.45],exit],boxes),'old path crossed the monitor base');
 assert.equal(defaultWaypoints([5,ROUTE_Y,0],exit,boxes),null);
});
test('desktop cable follows the mat across both edges and rests on the desk outside',()=>{
 const points=supportedPoints([[-7,ROUTE_Y,1],[5,ROUTE_Y,1]]);
 assert.equal(points[0][1],DESK_Y+WIRE_RADIUS);
 assert.equal(points.at(-1)[1],DESK_Y+WIRE_RADIUS);
 const edges=points.filter(p=>Math.abs(p[1]-DESK_Y-DESK_MAT.height-WIRE_RADIUS)<1e-7);
 assert.equal(edges.length,2);
 assert.ok(Math.abs(edges[0][0]-(DESK_MAT.x-DESK_MAT.w/2))<1e-6);
 assert.ok(Math.abs(edges[1][0]-(DESK_MAT.x+DESK_MAT.w/2))<1e-6);
});
