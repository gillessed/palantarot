/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = "./migration/psqlIngest.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./migration/psqlIngest.ts":
/*!*********************************!*\
  !*** ./migration/psqlIngest.ts ***!
  \*********************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var pg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pg */ \"pg\");\n/* harmony import */ var pg__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(pg__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n\nif (process.argv.length !== 4) {\n    console.log('Usage: node psqlInjest.js CONFIG_FILE DUMP_FILE');\n    process.exit(1);\n}\nconst config = JSON.parse(fs__WEBPACK_IMPORTED_MODULE_1__[\"readFileSync\"](process.argv[2], { encoding: 'utf8' }));\nconst dump = JSON.parse(fs__WEBPACK_IMPORTED_MODULE_1__[\"readFileSync\"](process.argv[3], { encoding: 'utf8' }));\nconsole.log(`Injesting ${dump.players.length} players, ${dump.hands.length} hands, and ${dump.playerHands.length} player hands.`);\nconst client = new pg__WEBPACK_IMPORTED_MODULE_0__[\"Client\"](config);\ninject();\nfunction inject() {\n    return __awaiter(this, void 0, void 0, function* () {\n        yield client.connect();\n        try {\n            const playerColumns = [\n                ['id', 'id'],\n                ['firstName', 'first_name'],\n                ['lastName', 'last_name'],\n            ];\n            yield insertType('players', playerColumns, dump.players, 10);\n            const handColumns = [\n                ['id', 'id'],\n                ['timestamp', 'timestamp'],\n                ['players', 'players'],\n                ['bidder', 'bidder_fk_id'],\n                ['partner', 'partner_fk_id'],\n                ['bidAmount', 'bid_amt'],\n                ['points', 'points'],\n                ['slam', 'slam'],\n            ];\n            yield insertType('hand', handColumns, dump.hands.map(sanitizeHand), 100);\n            const playerHandColumns = [\n                ['id', 'id'],\n                ['timestamp', 'timestamp'],\n                ['hand', 'hand_fk_id'],\n                ['player', 'player_fk_id'],\n                ['isBidder', 'was_bidder'],\n                ['isPartner', 'was_partner'],\n                ['showed', 'showed_trump'],\n                ['oneLast', 'one_last'],\n                ['points', 'points_earned'],\n            ];\n            yield insertType('player_hand', playerHandColumns, dump.playerHands.map(sanitizePlayerHand), 100);\n        }\n        finally {\n            client.end();\n        }\n    });\n}\nfunction sanitizeHand(hand) {\n    return Object.assign({}, hand, { slam: !!hand.slam });\n}\nfunction sanitizePlayerHand(playerHand) {\n    return Object.assign({}, playerHand, { isBidder: !!playerHand.isBidder, isPartner: !!playerHand.isPartner, showed: !!playerHand.showed, oneLast: !!playerHand.oneLast });\n}\nfunction insertType(table, columnMapping, data, chunkSize) {\n    return __awaiter(this, void 0, void 0, function* () {\n        const chunks = chunkify(data, chunkSize);\n        for (const chunk of chunks) {\n            yield insertChunk(table, columnMapping, chunk);\n        }\n        yield updateSequenceToMax(table);\n        console.log('Injested into table ' + table);\n    });\n}\nfunction insertChunk(table, columnMapping, chunk) {\n    return __awaiter(this, void 0, void 0, function* () {\n        const valueKeys = columnMapping.map((value) => value[0]);\n        const values = chunk.map((data) => toValueString(data, valueKeys));\n        const valuesString = values.join(', ');\n        const columnString = columnMapping.map((value) => value[1]).join(', ');\n        const statement = `INSERT INTO ${table} (${columnString}) VALUES ${valuesString}`;\n        yield client.query(statement);\n    });\n}\nfunction updateSequenceToMax(table, column = 'id') {\n    return __awaiter(this, void 0, void 0, function* () {\n        const sequence = `${table}_${column}_seq`;\n        const maxIdResult = yield client.query(`SELECT max(${column}) FROM ${table}`);\n        const maxId = maxIdResult.rows[0].max;\n        yield client.query(`ALTER SEQUENCE ${sequence} RESTART ${maxId + 1}`);\n    });\n}\nfunction chunkify(array, count = 100) {\n    const chunks = [];\n    while (array.length > 0) {\n        chunks.push(array.splice(0, count));\n    }\n    return chunks;\n}\nfunction toValueString(object, keys) {\n    return '(' + keys.map((key) => {\n        return object[key] === undefined ? 'null' : `'${object[key]}'`;\n    }).join(', ') + ')';\n}\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHNxbEluZ2VzdC5qcyIsInNvdXJjZVJvb3QiOiIiLCJzb3VyY2VzIjpbIi4uLy4uL21pZ3JhdGlvbi9wc3FsSW5nZXN0LnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7O0FBQUEsT0FBTyxFQUFFLE1BQU0sRUFBRSxNQUFNLElBQUksQ0FBQztBQUM1QixPQUFPLEtBQUssRUFBRSxNQUFNLElBQUksQ0FBQztBQUl6QixJQUFJLE9BQU8sQ0FBQyxJQUFJLENBQUMsTUFBTSxLQUFLLENBQUMsRUFBRTtJQUMzQixPQUFPLENBQUMsR0FBRyxDQUFDLGlEQUFpRCxDQUFDLENBQUM7SUFDL0QsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsQ0FBQztDQUNuQjtBQUVELE1BQU0sTUFBTSxHQUFjLElBQUksQ0FBQyxLQUFLLENBQUMsRUFBRSxDQUFDLFlBQVksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUMsQ0FBQztBQUM3RixNQUFNLElBQUksR0FBUyxJQUFJLENBQUMsS0FBSyxDQUFDLEVBQUUsQ0FBQyxZQUFZLENBQUMsT0FBTyxDQUFDLElBQUksQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLFFBQVEsRUFBRSxNQUFNLEVBQUUsQ0FBQyxDQUFDLENBQUM7QUFDdEYsT0FBTyxDQUFDLEdBQUcsQ0FBQyxhQUFhLElBQUksQ0FBQyxPQUFPLENBQUMsTUFBTSxhQUFhLElBQUksQ0FBQyxLQUFLLENBQUMsTUFBTSxlQUFlLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxnQkFBZ0IsQ0FBQyxDQUFDO0FBQ2xJLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBQ2xDLE1BQU0sRUFBRSxDQUFDO0FBRVQsU0FBZSxNQUFNOztRQUNqQixNQUFNLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUV2QixJQUFJO1lBQ0EsTUFBTSxhQUFhLEdB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\n\n//# sourceURL=webpack:///./migration/psqlIngest.ts?");

/***/ }),

/***/ "fs":
/*!*********************!*\
  !*** external "fs" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"fs\");\n\n//# sourceURL=webpack:///external_%22fs%22?");

/***/ }),

/***/ "pg":
/*!*********************!*\
  !*** external "pg" ***!
  \*********************/
/*! no static exports found */
/***/ (function(module, exports) {

eval("module.exports = require(\"pg\");\n\n//# sourceURL=webpack:///external_%22pg%22?");

/***/ })

/******/ });