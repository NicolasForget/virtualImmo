// Import JQuery
import $ from 'jquery/dist/jquery.min';

import TUIOWidget from 'tuiomanager/core/TUIOWidget';
import { WINDOW_WIDTH, WINDOW_HEIGHT } from 'tuiomanager/core/constants';
import { radToDeg } from 'tuiomanager/core/helpers';

/**
 * Main class to manage FurnitureWidget.
 *
 * @class FurnitureWidget
 * @extends TUIOWidget
 */
class FurnitureWidget extends TUIOWidget {
  /**
   * FurnitureWidget constructor.
   *
   * @constructor
   * @param {number} x - FurnitureWidget's upperleft coin abscissa.
   * @param {number} y - FurnitureWidget's upperleft coin ordinate.
   * @param {number} width - FurnitureWidget's width.
   * @param {number} height - FurnitureWidget's height.
   */
  constructor(x, y, width, height, domE) {
    super(x, y, width, height);

    this._lastTouchesValues = {};
    this._lastTagsValues = {};
    this._domElem = domE;
  }

  /**
   * FurnitureWidget's domElem.
   *
   * @returns {JQuery Object} FurnitureWidget's domElem.
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
    if (typeof (this._lastTouchesValues[tuioTouch.id]) !== 'undefined') {
      const lastTouchValue = this._lastTouchesValues[tuioTouch.id];

      const diffX = tuioTouch.x - lastTouchValue.x;
      const diffY = tuioTouch.y - lastTouchValue.y;

      let newX = this.x + diffX;
      let newY = this.y + diffY;

      let oldX = parseInt(this._domElem.getAttribute('transform').split(/\,|\(|\)/)[1]);
      let oldY = parseInt(this._domElem.getAttribute('transform').split(/\,|\(|\)/)[2]);

      this._domElem.setAttribute('transform','translate('+ (oldX + newX) +','+ (oldY + newY) +')scale(1)');
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
   * Call after a TUIOTag creation.
   *
   * @method onTagCreation
   * @param {TUIOTag} tuioTag - A TUIOTag instance.
   */
  onTagCreation(tuioTag) {
    super.onTagCreation(tuioTag);
    if (this.isTouched(tuioTag.x, tuioTag.y)) {
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

      let newX = this.x + diffX;
      let newY = this.y + diffY;

      if (newX < 0) {
        newX = 0;
      }

      if (newX > (WINDOW_WIDTH - this.width)) {
        newX = WINDOW_WIDTH - this.width;
      }

      if (newY < 0) {
        newY = 0;
      }

      if (newY > (WINDOW_HEIGHT - this.height)) {
        newY = WINDOW_HEIGHT - this.height;
      }

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
   * Move FurnitureWidget.
   *
   * @method moveTo
   * @param {string/number} x - New FurnitureWidget's abscissa.
   * @param {string/number} y - New FurnitureWidget's ordinate.
   * @param {number} angle - New FurnitureWidget's angle.
   */
  moveTo(x, y, angle = null) {
    this._x = x;
    this._y = y;
    this._domElem.css('left', `${x}px`);
    this._domElem.css('top', `${y}px`);
    if (angle !== null) {
      this._domElem.css('transform', `rotate(${angle}deg)`);
    }
  }
}

export default FurnitureWidget;
