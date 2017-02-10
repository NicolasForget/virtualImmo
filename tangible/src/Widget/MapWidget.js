import TUIOWidget from 'tuiomanager/core/TUIOWidget';
// import { WINDOW_WIDTH, WINDOW_HEIGHT } from 'tuiomanager/core/constants';
import { radToDeg } from 'tuiomanager/core/helpers';

/**
 * Main class to manage MapWidget.
 *
 * @class MapWidget
 * @extends TUIOWidget
 */
class MapWidget extends TUIOWidget {
  /**
   * MapWidget constructor.
   *
   * @constructor
   * @param {number} x - MapWidget's upperleft coin abscissa.
   * @param {number} y - MapWidget's upperleft coin ordinate.
   * @param {number} width - MapWidget's width.
   * @param {number} height - MapWidget's height.
   */
  constructor(x, y, width, height) {
    super(x, y, width, height);

    this._lastTouchesValues = {};
    this._lastTagsValues = {};

    this._domElem = document.getElementsByClassName('zoomArea');
    console.log(this._domElem);
  }

  /**
   * MapWidget's domElem.
   *
   * @returns {JQuery Object} MapWidget's domElem.
   */
  get domElem() { return this._domElem; }

  /**
   * Call after a TUIOTouch creation.
   *
   * @method onTouchCreation
   * @param {TUIOTouch} tuioTouch - A TUIOTouch instance.
   */
  onTouchCreation(tuioTouch) {
    super.onTouchCreation(tuioTouch);
    if (this.isTouched(tuioTouch.x, tuioTouch.y)) {
      this._lastTouchesValues = {
        ...this._lastTouchesValues,
        [tuioTouch.id]: {
        x: tuioTouch.x,
        y: tuioTouch.y,
      },
    };
    }
  }

  /**
   * Call after a TUIOTouch update.
   *
   * @method onTouchUpdate
   * @param {TUIOTouch} tuioTouch - A TUIOTouch instance.
   */
  onTouchUpdate(tuioTouch) {
    /*if (typeof (this._lastTouchesValues[tuioTouch.id]) !== 'undefined') {
      const lastTouchValue = this._lastTouchesValues[tuioTouch.id];

      const diffX = tuioTouch.x - lastTouchValue.x;
      const diffY = tuioTouch.y - lastTouchValue.y;

      let newX = this.x + diffX;
      let newY = this.y + diffY;

      let oldX = parseInt(this._domElem[0].getAttribute('transform').split(/\,|\(|\)/)[1]);
      let oldY = parseInt(this._domElem[0].getAttribute('transform').split(/\,|\(|\)/)[2]);

      this._domElem[0].setAttribute('transform','translate('+ (oldX + newX) +','+ (oldY + newY) +')scale(1)');
      this._lastTouchesValues = {
        ...this._lastTouchesValues,
        [tuioTouch.id]: {
          x: tuioTouch.x,
          y: tuioTouch.y,
      },
    };
    }*/
  }

  /**
   * Call after a TUIOTag creation.
   *
   * @method onTagCreation
   * @param {TUIOTag} tuioTag - A TUIOTag instance.
   */
  onTagCreation(tuioTag) {
    super.onTagCreation(tuioTag);
    if (this.isTouched(tuioTag.x, tuioTag.y)) {

      tuioTagMenu(tuioTag.x,tuioTag.y);

      this._lastTagsValues = {
        ...this._lastTagsValues,
        [tuioTag.id]: {
        x: tuioTag.x,
        y: tuioTag.y,
      },
    };
    }
  }

  /**
   * Call after a TUIOTag creation.
   *
   * @method onTagCreation
   * @param {TUIOTag} tuioTag - A TUIOTag instance.
   */
  onTagDeletion(tuioTagId) {
    super.onTagDeletion(tuioTagId);
    tuioMenuDelete();
  }

  /**
   * Call after a TUIOTag update.
   *
   * @method onTagUpdate
   * @param {TUIOTag} tuioTag - A TUIOTag instance.
   */
  onTagUpdate(tuioTag) {
    if (typeof (this._lastTagsValues[tuioTag.id]) !== 'undefined') {
      const lastTagValue = this._lastTagsValues[tuioTag.id];
      const diffX = tuioTag.x - lastTagValue.x;
      const diffY = tuioTag.y - lastTagValue.y;

      const newX = this.x + diffX;
      const newY = this.y + diffY;

      this.moveTo(newX, newY, radToDeg(tuioTag.angle));
      this._lastTagsValues = {
        ...this._lastTagsValues,
        [tuioTag.id]: {
        x: tuioTag.x,
        y: tuioTag.y,
      },
    };
    }
  }

  /**
   * Move MapWidget.
   *
   * @method moveTo
   * @param {string/number} x - New MapWidget's abscissa.
   * @param {string/number} y - New MapWidget's ordinate.
   * @param {number} angle - New MapWidget's angle.
   */
  moveTo(x, y, angle = null) {
    tuioMenuMove(x, y);
    if (angle !== null) {
      rotateMenu(angle,'menu-holder');
    }
  }
}

export default MapWidget;
