'use strict';
const crypto = require('node:crypto');

const gameObj = {
  playerMap: new Map(),
  itemMap: new Map(),
  airMap: new Map(),
  fieldWidth: 1000,
  fieldHeight: 1000,
  itemTotal: 15,
  airTotal: 10
};

function init() {
  for(let i = 0; i < gameObj.itemTotal; i++) {
    addItem();
  }
  for(let a = 0; a < gameObj.airTotal; a++) {
    addAir();
  }
}

init(); //初期化 サーバー起動時に行う

function newConnection(socketId, displayName, thumbUrl) {
  const playerX = Math.floor(Math.random() * gameObj.fieldWidth);
  const playerY = Math.floor(Math.random() * gameObj.fieldHeight);
  const playerId = crypto.createHash('sha1').update(socketId).digest('hex');

  const playerObj = {
    x: playerX,
    y: playerY,
    playerId: playerId,
    displayName: displayName,
    thumbUrl: thumbUrl,
    isAlive: true,
    direction: 'right',
    score: 0
  };
  gameObj.playerMap.set(socketId, playerObj);

  const startObj = {
    playerObj: playerObj,
    fieldWidth: gameObj.fieldWidth,
    fieldHeight: gameObj.fieldHeight
  };
  return startObj;
}

function getMapData() {
  const playersArray = [];
  const itemArray = [];
  const airArray = [];

  for(let [socketId, plyer] of gameObj.playerMap) {
    const playerDataForSend = [];

    playerDataForSend.push(plyer.x);
    playerDataForSend.push(plyer.y);
    playerDataForSend.push(plyer.playerId);
    playerDataForSend.push(plyer.displayName);
    playerDataForSend.push(plyer.score);
    playerDataForSend.push(plyer.isAlive);
    playerDataForSend.push(plyer.direction);

    playersArray.push(playerDataForSend);
  }

  for(let [id, item] of gameObj.itemMap) {
    const itemDataForSend = [];

    itemDataForSend.push(item.x);
    itemDataForSend.push(item.y);

    itemArray.push(itemDataForSend);
  }

  for(let [id, air] of gameObj.airMap) {
    const airDataForSend = [];

    airDataForSend.push(air.x);
    airDataForSend.push(air.y)

    airArray.push(airDataForSend);
  }

  return [playersArray, itemArray, airArray]
}

function disconnect(socketId) {
  gameObj.playerMap.delete(socketId);
}

function addItem() {
  const itemX = Math.floor(Math.random() * gameObj.fieldWidth);
  const itemY = Math.floor(Math.random() * gameObj.fieldHeight);
  const itemKey = `${itemX},${itemY}`;

  if(gameObj.itemMap.has(itemKey)) {  // アイテムの位置が被ってしまった場合は
    return addItem();
  }

  const itemObj = {
    x: itemX,
    y: itemY,
  };
  gameObj.itemMap.set(itemKey,itemObj)
}

function addAir() {
  const airX = Math.floor(Math.random() * gameObj.fieldWidth);
  const airY = Math.floor(Math.random() * gameObj.fieldHeight);
  const airKey = `${airX},${airY}`;

  if(gameObj.airMap.has(airKey)) {
    return addAir();
  }

  const airObj = {
    x: airX,
    y: airY,
  };
  gameObj.airMap.set(airKey,airObj);
}

module.exports = {
  newConnection,
  getMapData,
  disconnect
};