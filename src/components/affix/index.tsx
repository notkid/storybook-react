import * as React from 'react';
import {
  getTargetRect,
  getFixedTop,
  getFixedBottom,
  addObserveTarget,
  removeObserveTarget,
  throttleByAnimationFrameDecorator,
} from './utils';

function getDefaultTarget() {
  return typeof window !== 'undefined' ? window : null;
}

export interface AffixProps {
  offsetBottom?: number;
  offsetTop?: number;
  className?: string;
  style?: React.CSSProperties;
  target?: () => Window | HTMLElement | null;
}

enum AffixStatus {
  None,
  Prepare,
}

export interface AffixState {
  status: AffixStatus;
  affixStyle?: React.CSSProperties;
  placeholderStyle?: React.CSSProperties;
  lastAffix: boolean;
  prevTarget: Window | HTMLElement | null;
}

class Affix extends React.Component<AffixProps, AffixState> {
  static defaultProps = {
    target: getDefaultTarget,
  };

  constructor(props: AffixProps) {
    super(props);
  }

  state: AffixState = {
    status: AffixStatus.None,
    prevTarget: null,
    lastAffix: false,
  };

  placeholderNode: HTMLDivElement;
  fixedNode: HTMLDivElement;

  componentDidMount() {
    const { target } = this.props;
    if (target) {
      addObserveTarget(target(), this);
      this.updatePosition({} as Event);
    }
  }

  componentDidUpdate(prevProps: AffixProps) {
    const { prevTarget } = this.state;
    const { target } = this.props;
    let newTarget = null;
    if (target) {
      newTarget = target() || null;
    }

    if (prevTarget !== newTarget) {
      removeObserveTarget(this);
      if (newTarget) {
        addObserveTarget(newTarget, this);
        this.updatePosition({} as Event);
        (this.updatePosition as any).cancel();
      }
    }

    this.measure();
  }

  componentWillUnmount() {
    removeObserveTarget(this);
  }

  @throttleByAnimationFrameDecorator()
  updatePosition(event?: Event | null) {
    this.prepareMeasure(event);
  }

  @throttleByAnimationFrameDecorator()
  lazyUpdatePosition(event: Event) {
    const { target } = this.props;
    const { affixStyle } = this.state;

    if (target && affixStyle) {
      const offsetTop = this.getOffsetTop();
      const offsetBottom = this.getOffsetBottom();

      const targetNode = target();
      if (targetNode) {
        const targetRect = getTargetRect(targetNode);
        const placeholderReact = getTargetRect(this.placeholderNode);
        const fixedTop = getFixedTop(placeholderReact, targetRect, offsetTop);
        const fixedBottom = getFixedBottom(placeholderReact, targetRect, offsetBottom);

        if (
          (fixedTop !== undefined && affixStyle.top === fixedTop) ||
          (fixedBottom !== undefined && affixStyle.bottom === fixedBottom)
        ) {
          return;
        }
      }
    }
    this.prepareMeasure(event);
  }

  prepareMeasure = (event?: Event | null) => {
    const newState: Partial<AffixState> = {
      status: AffixStatus.Prepare,
      affixStyle: undefined,
      placeholderStyle: undefined,
    };
    this.setState(newState as AffixState);
  };

  getOffsetTop = () => {
    const { offsetBottom } = this.props;
    let { offsetTop } = this.props;
    if (typeof offsetTop === 'undefined') {
    }
    if (offsetBottom === undefined && offsetTop === undefined) {
      offsetTop = 0;
    }
    return offsetTop;
  };

  getOffsetBottom = () => {
    const { offsetBottom } = this.props;
    return offsetBottom;
  };

  measure = () => {
    const { target } = this.props;
    const { status } = this.state;
    if (!target || status !== AffixStatus.Prepare) {
      return;
    }
    const offsetTop = this.getOffsetTop();
    const offsetBottom = this.getOffsetBottom();

    const targetNode = target();
    if (!targetNode) {
      return;
    }

    const newState: Partial<AffixState> = {
      status: AffixStatus.None,
    };
    const targetRect = getTargetRect(targetNode);
    const placeholderReact = getTargetRect(this.placeholderNode);
    const fixedTop = getFixedTop(placeholderReact, targetRect, offsetTop);
    const fixedBottom = getFixedBottom(placeholderReact, targetRect, offsetBottom);

    if (fixedTop !== undefined) {
      newState.affixStyle = {
        position: 'fixed',
        top: fixedTop,
        width: placeholderReact.width,
        height: placeholderReact.height,
      };
      newState.placeholderStyle = {
        width: placeholderReact.width,
        height: placeholderReact.height,
      };
    } else if (fixedBottom !== undefined) {
      newState.affixStyle = {
        position: 'fixed',
        bottom: fixedBottom,
        width: placeholderReact.width,
        height: placeholderReact.height,
      };
      newState.placeholderStyle = {
        width: placeholderReact.width,
        height: placeholderReact.height,
      };
    }

    this.setState(newState as AffixState);
  };

  savePlaceholderNode = (node: HTMLDivElement) => {
    this.placeholderNode = node;
  };

  saveFixedNode = (node: HTMLDivElement) => {
    this.fixedNode = node;
  };

  render() {
    const { children, style = {} } = this.props;
    const { placeholderStyle } = this.state;

    const mergedPlaceholderStyle = {
      ...placeholderStyle,
      ...style,
    };

    return (
      <div style={mergedPlaceholderStyle} ref={this.savePlaceholderNode}>
        <div ref={this.saveFixedNode} style={this.state.affixStyle}>
          {children}
        </div>
      </div>
    );
  }
}

export default Affix;
