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
/******/ 	return __webpack_require__(__webpack_require__.s = "./migration/psqlDump.ts");
/******/ })
/************************************************************************/
/******/ ({

/***/ "./migration/psqlDump.ts":
/*!*******************************!*\
  !*** ./migration/psqlDump.ts ***!
  \*******************************/
/*! no exports provided */
/***/ (function(module, __webpack_exports__, __webpack_require__) {

"use strict";
eval("__webpack_require__.r(__webpack_exports__);\n/* harmony import */ var pg__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! pg */ \"pg\");\n/* harmony import */ var pg__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(pg__WEBPACK_IMPORTED_MODULE_0__);\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! fs */ \"fs\");\n/* harmony import */ var fs__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(fs__WEBPACK_IMPORTED_MODULE_1__);\nvar __awaiter = (undefined && undefined.__awaiter) || function (thisArg, _arguments, P, generator) {\n    return new (P || (P = Promise))(function (resolve, reject) {\n        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }\n        function rejected(value) { try { step(generator[\"throw\"](value)); } catch (e) { reject(e); } }\n        function step(result) { result.done ? resolve(result.value) : new P(function (resolve) { resolve(result.value); }).then(fulfilled, rejected); }\n        step((generator = generator.apply(thisArg, _arguments || [])).next());\n    });\n};\n\n\nif (process.argv.length !== 4) {\n    console.log('Usage: node psqlDump.js CONFIG_FILE DUMP_FILE');\n    process.exit(1);\n}\nconst config = JSON.parse(fs__WEBPACK_IMPORTED_MODULE_1__[\"readFileSync\"](process.argv[2], { encoding: 'utf8' }));\nconst client = new pg__WEBPACK_IMPORTED_MODULE_0__[\"Client\"](config);\ndumpAll();\nfunction dumpAll() {\n    return __awaiter(this, void 0, void 0, function* () {\n        yield client.connect();\n        try {\n            const playerResult = yield client.query('SELECT * FROM players');\n            const players = playerResult.rows.map((player) => {\n                return {\n                    id: player['id'],\n                    firstName: player['first_name'],\n                    lastName: player['last_name'],\n                };\n            });\n            const handsResult = yield client.query('SELECT * FROM hand');\n            const hands = handsResult.rows.map((hand) => {\n                return {\n                    id: hand['id'],\n                    timestamp: hand['timestamp'],\n                    players: hand['players'],\n                    bidder: hand['bidder_fk_id'],\n                    partner: hand['partner_fk_id'] || undefined,\n                    bidAmount: hand['bid_amt'],\n                    points: hand['points'],\n                    slam: !!hand['slam'],\n                };\n            });\n            const playerHandsResult = yield client.query('SELECT * FROM player_hand');\n            const playerHands = playerHandsResult.rows.map((playerHand) => {\n                return {\n                    id: playerHand['id'],\n                    timestamp: playerHand['timestamp'],\n                    hand: playerHand['hand_fk_id'],\n                    player: playerHand['player_fk_id'],\n                    isBidder: playerHand['was_bidder'],\n                    isPartner: playerHand['was_partner'],\n                    showed: playerHand['showed_trump'],\n                    oneLast: playerHand['one_last'],\n                    points: playerHand['points_earned'],\n                };\n            });\n            const dump = { players, hands, playerHands };\n            const serialized = JSON.stringify(dump);\n            console.log('Writing ' + serialized.length + ' characters to file ' + process.argv[3]);\n            fs__WEBPACK_IMPORTED_MODULE_1__[\"writeFileSync\"](process.argv[3], serialized, { encoding: 'utf8' });\n        }\n        finally {\n            client.end();\n        }\n    });\n}\n//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicHNxbER1bXAuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlcyI6WyIuLi8uLi9taWdyYXRpb24vcHNxbER1bXAudHMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6Ijs7Ozs7Ozs7QUFBQSxPQUFPLEVBQUUsTUFBTSxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBQzVCLE9BQU8sS0FBSyxFQUFFLE1BQU0sSUFBSSxDQUFDO0FBSXpCLElBQUksT0FBTyxDQUFDLElBQUksQ0FBQyxNQUFNLEtBQUssQ0FBQyxFQUFFO0lBQzNCLE9BQU8sQ0FBQyxHQUFHLENBQUMsK0NBQStDLENBQUMsQ0FBQztJQUM3RCxPQUFPLENBQUMsSUFBSSxDQUFDLENBQUMsQ0FBQyxDQUFDO0NBQ25CO0FBQ0QsTUFBTSxNQUFNLEdBQWMsSUFBSSxDQUFDLEtBQUssQ0FBQyxFQUFFLENBQUMsWUFBWSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxRQUFRLEVBQUUsTUFBTSxFQUFFLENBQUMsQ0FBQyxDQUFDO0FBQzdGLE1BQU0sTUFBTSxHQUFHLElBQUksTUFBTSxDQUFDLE1BQU0sQ0FBQyxDQUFDO0FBRWxDLE9BQU8sRUFBRSxDQUFDO0FBQ1YsU0FBZSxPQUFPOztRQUNsQixNQUFNLE1BQU0sQ0FBQyxPQUFPLEVBQUUsQ0FBQztRQUV2QixJQUFJO1lBQ0EsTUFBTSxZQUFZLEdBQUcsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLHVCQUF1QixDQUFDLENBQUM7WUFDakUsTUFBTSxPQUFPLEdBQWEsWUFBWSxDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxNQUFXLEVBQUUsRUFBRTtnQkFDNUQsT0FBTztvQkFDSCxFQUFFLEVBQUUsTUFBTSxDQUFDLElBQUksQ0FBQztvQkFDaEIsU0FBUyxFQUFFLE1BQU0sQ0FBQyxZQUFZLENBQUM7b0JBQy9CLFFBQVEsRUFBRSxNQUFNLENBQUMsV0FBVyxDQUFDO2lCQUNoQyxDQUFDO1lBQ04sQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLFdBQVcsR0FBRyxNQUFNLE1BQU0sQ0FBQyxLQUFLLENBQUMsb0JBQW9CLENBQUMsQ0FBQztZQUM3RCxNQUFNLEtBQUssR0FBVyxXQUFXLENBQUMsSUFBSSxDQUFDLEdBQUcsQ0FBQyxDQUFDLElBQVMsRUFBRSxFQUFFO2dCQUNyRCxPQUFPO29CQUNILEVBQUUsRUFBRSxJQUFJLENBQUMsSUFBSSxDQUFDO29CQUNkLFNBQVMsRUFBRSxJQUFJLENBQUMsV0FBVyxDQUFDO29CQUM1QixPQUFPLEVBQUUsSUFBSSxDQUFDLFNBQVMsQ0FBQztvQkFDeEIsTUFBTSxFQUFFLElBQUksQ0FBQyxjQUFjLENBQUM7b0JBQzVCLE9BQU8sRUFBRSxJQUFJLENBQUMsZUFBZSxDQUFDLElBQUksU0FBUztvQkFDM0MsU0FBUyxFQUFFLElBQUksQ0FBQyxTQUFTLENBQUM7b0JBQzFCLE1BQU0sRUFBRSxJQUFJLENBQUMsUUFBUSxDQUFDO29CQUN0QixJQUFJLEVBQUUsQ0FBQyxDQUFDLElBQUksQ0FBQyxNQUFNLENBQUM7aUJBQ3ZCLENBQUM7WUFDTixDQUFDLENBQUMsQ0FBQztZQUNILE1BQU0saUJBQWlCLEdBQUcsTUFBTSxNQUFNLENBQUMsS0FBSyxDQUFDLDJCQUEyQixDQUFDLENBQUM7WUFDMUUsTUFBTSxXQUFXLEdBQWlCLGlCQUFpQixDQUFDLElBQUksQ0FBQyxHQUFHLENBQUMsQ0FBQyxVQUFlLEVBQUUsRUFBRTtnQkFDN0UsT0FBTztvQkFDSCxFQUFFLEVBQUUsVUFBVSxDQUFDLElBQUksQ0FBQztvQkFDcEIsU0FBUyxFQUFFLFVBQVUsQ0FBQyxXQUFXLENBQUM7b0JBQ2xDLElBQUksRUFBRSxVQUFVLENBQUMsWUFBWSxDQUFDO29CQUM5QixNQUFNLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQztvQkFDbEMsUUFBUSxFQUFFLFVBQVUsQ0FBQyxZQUFZLENBQUM7b0JBQ2xDLFNBQVMsRUFBRSxVQUFVLENBQUMsYUFBYSxDQUFDO29CQUNwQyxNQUFNLEVBQUUsVUFBVSxDQUFDLGNBQWMsQ0FBQztvQkFDbEMsT0FBTyxFQUFFLFVBQVUsQ0FBQyxVQUFVLENBQUM7b0JBQy9CLE1BQU0sRUFBRSxVQUFVLENBQUMsZUFBZSxDQUFDO2lCQUN0QyxDQUFDO1lBQ04sQ0FBQyxDQUFDLENBQUM7WUFDSCxNQUFNLElBQUksR0FBRyxFQUFFLE9BQU8sRUFBRSxLQUFLLEVBQUUsV0FBVyxFQUFFLENBQUM7WUFDN0MsTUFBTSxVQUFVLEdBQUcsSUFBSSxDQUFDLFNBQVMsQ0FBQyxJQUFJLENBQUMsQ0FBQztZQUN4QyxPQUFPLENBQUMsR0FBRyxDQUFDLFVBQVUsR0FBRyxVQUFVLENBQUMsTUFBTSxHQUFHLHNCQUFzQixHQUFHLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQztZQUN2RixFQUFFLENBQUMsYUFBYSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsQ0FBQyxDQUFDLEVBQUUsVUFBVSxFQUFFLEVBQUUsUUFBUSxFQUFFLE1BQU0sRUFBRSxDQUFDLENBQUM7U0FDdkU7Z0JBQVM7WUFDTixNQUFNLENBQUMsR0FBRyxFQUFFLENBQUM7U0FDaEI7SUFDTCxDQUFDO0NBQUEifQ==\n\n//# sourceURL=webpack:///./migration/psqlDump.ts?");

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