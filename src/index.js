import React, { Component } from 'react';
import moment from 'moment';
import { isSameDate, isDisabled } from './utils/utils';

export function setMomentLocale(locale) {
  moment.locale(locale);
};

const PERIOD_SELECTION_STATES = {
  NO_SELECTION: 0,
  ONE_DATE_SELECTED: 1,
  PERIOD_SELECTED: 2
};

export default class ScrollCalendar extends Component {
  constructor(props) {
    super(props);
    this.handleSelectedDate = this.handleSelectedDate.bind(this);
  }

  handleSelectedDate(e, value) {
    let selectedValue = Object.assign({}, this.props.value);
    const selectionState = ((selectedValue) => {
      if(selectedValue === undefined) {
        return PERIOD_SELECTION_STATES.NO_SELECTION;
      } else if(moment.isMoment(selectedValue)) {
        return PERIOD_SELECTION_STATES.ONE_DATE_SELECTED;
      } else if(moment.isMoment(selectedValue.startDate) && !moment.isMoment(selectedValue.endDate)) {
        return PERIOD_SELECTION_STATES.ONE_DATE_SELECTED;
      } else {
        return PERIOD_SELECTION_STATES.PERIOD_SELECTED;
      }
    })(selectedValue);
    e && e.preventDefault();
    if(!this.props.periodSelection ||(
      selectionState === PERIOD_SELECTION_STATES.NO_SELECTION ||
      selectionState === PERIOD_SELECTION_STATES.PERIOD_SELECTED)) {
      if(this.props.onSelect) {
        this.props.onSelect({
          startDate: value,
          endDate: undefined 
        });
      }
    } else if(selectionState === PERIOD_SELECTION_STATES.ONE_DATE_SELECTED) {
      const { startDate } = selectedValue;
      if(startDate.isBefore(value)) {
        if(this.props.onSelect) {
          this.props.onSelect({
            startDate: startDate,
            endDate: value,
          });
        }
      } else if(startDate.isAfter(value)) {
        if(this.props.onSelect) {
          this.props.onSelect({
            startDate: value,
            endDate: startDate,
          });
        }
      }
    }
  }

  componentWillReceiveProps(props) {
    if (props.selectedDate) {
      this.setSelectedDate(props.selectedDate);
    }
  }

  render() {
    let props = {
      minDate: this.props.minDate,
      maxDate: this.props.maxDate,
      handleSelect: this.handleSelectedDate,
      className: this.props.className + ' mobile-datepicker',
      yearFormat: this.props.yearFormat,
      monthFormat: this.props.monthFormat,
      enableYearTitle: this.props.enableYearTitle,
      enableMonthTitle: this.props.enableMonthTitle,
      weekStartsOnMonday: this.props.weekStartsOnMonday === undefined ? false : this.props.weekStartsOnMonday,
      renderDay: this.props.renderDay,
      renderMonthHeader: this.props.renderMonthHeader,
      periodSelection: this.props.periodSelection,
    };
    if(this.props.value !== undefined) {
      if(moment.isMoment(this.props.value)) {
        props.startDate = this.props.value;
      } else {
        props = { ...this.props.value, ...props };
      }
    }
    return (
      <RenderCalendarYear {...props} />
    );
  }
}

export const RenderCalendarYear = props => {
  let { minDate, maxDate } = props;
  let totalMonth = Math.round(maxDate.diff(minDate, 'months', true)) + 1;
  let now = moment(minDate, 'DD/MMM/YYYY');
  let elements = [];
  for (let i = 0; i < totalMonth; i++) {
    elements.push(
      <RenderMonthCard key={i} currentMonth={now.clone()} {...props} />
    );
    now = now.add(1, 'M');
  }
  return (
    <div className={props.className}>
      {elements}
    </div>
  );
};

export const RenderMonthCard = props => {
  const renderMonthHeader = () => {
    if(props.renderMonthHeader !== undefined) {
      return props.renderMonthHeader({ date: now });
    } else {
      return (<RenderMonthHeader date={now} {...props}/>);
    }
  };
  let now = props.currentMonth;
  return (
    <section className="month" id={now.format('MMMM-YYYY')}>
      { renderMonthHeader() }
      <RenderDayHeader {...props} />
      <RenderDays date={now} {...props} />
    </section>
  );
};

export const RenderMonthHeader = props => {
  let month = props.date.format(props.monthFormat);
  let year = props.date.format(props.yearFormat);
  return (
    <p className="month-title">
      {props.enableYearTitle ? <span>{year}</span> : null}
      {props.enableMonthTitle ? month : null}
    </p>
  );
};

export const RenderDayHeader = ({ weekStartsOnMonday }) => {
  const weekDays = moment.weekdaysMin();
  if(weekStartsOnMonday) {
    return (
      <ul className="days">
        <li key={'Monday'}>{weekDays[1]}</li>
        <li key={'Tuesday'}>{weekDays[2]}</li>
        <li key={'Wednesday'}>{weekDays[3]}</li>
        <li key={'Thursday'}>{weekDays[4]}</li>
        <li key={'Friday'}>{weekDays[5]}</li>
        <li key={'Saturday'}>{weekDays[6]}</li>
        <li key={'Sunday'}>{weekDays[0]}</li>
      </ul>
    );
  } else {
    return (
      <ul className="days">
      <li key={'Sunday'}>{weekDays[0]}</li>
      <li key={'Monday'}>{weekDays[1]}</li>
      <li key={'Tuesday'}>{weekDays[2]}</li>
      <li key={'Wednesday'}>{weekDays[3]}</li>
      <li key={'Thursday'}>{weekDays[4]}</li>
      <li key={'Friday'}>{weekDays[5]}</li>
      <li key={'Saturday'}>{weekDays[6]}</li>
      </ul>
    );
  }
};

export const RenderSingleDay = ({
  isActive,
  isInSelectedPeriod,
  currentValue,
  isDisabled
}) => {
  let className = (
    '' + (isActive ? ' active' : '') +
    (isDisabled ? ' disabled' : '') +
    (isInSelectedPeriod ? ' active-period' : '')
  );
  return (
    <div
      className={className}
    >
      <span>{currentValue.date()}</span>
    </div>
  );
};

export const RenderDays = ({
  date,
  startDate,
  endDate,
  handleSelect,
  minDate,
  maxDate,
  weekStartsOnMonday,
  renderDay
}) => {
  const getDay = (date) => {
    const jsDay = date.day();
    if(weekStartsOnMonday) {
      if(jsDay === 0) {
        return 6;
      } else {
        return jsDay - 1;
      }
    } else {
      return jsDay;
    }
  }

  let daysInMonth = date.daysInMonth();
  let monthStartDate = date.startOf('month');
  let balanceDayCount = getDay(monthStartDate);
  let renderDayFun = (props) => {
    if(renderDay !== undefined) {
      return renderDay(props);
    } else {
      return <RenderSingleDay {...props}/>;
    }
  };

  let renderDays = () => {
    let elements = [];
    let now = moment(date, 'DD/MMM/YYYY');
    let dayProps; 
    for (let i = 1; i <= daysInMonth; i++) {
      let day = now.clone();
      dayProps = {
        isInSelectedPeriod: day.isSameOrAfter(startDate) && day.isSameOrBefore(endDate),
        isActive: isSameDate(day.clone(), startDate) || isSameDate(day.clone(), endDate),
        isDisabled: isDisabled(minDate, day.clone(), maxDate),
        currentValue: day.clone(),
      };
      let clickHandlerProp = {};
      if(!dayProps.isDisabled) {
        clickHandlerProp = {onClick: e => handleSelect(e, day)};
      }
      elements.push(
        <li
          key={i}
          className="day-container"
          {...clickHandlerProp}
        >
          { renderDayFun(dayProps) }
        </li>
      );
      now = now.add(1, 'days');
    }
    return elements;
  };
  let renderPlaceholderDays = balanceDayCount => {
    let elements = [];
    for (let i = 0; i < balanceDayCount; i++) {
      elements.push(<li className="visible-hidden" key={i} />);
    }
    return elements;
  };
  return (
    <ul className="date">
      {renderPlaceholderDays(balanceDayCount)}
      {renderDays()}
    </ul>
  );
};

ScrollCalendar.defaultProps = {
  minDate: moment().add(1, 'd'),
  maxDate: moment().add(9, 'M'),
  value: null,
  monthFormat: 'MMMM',
  yearFormat: 'YYYY',
  enableYearTitle: true,
  enableMonthTitle: true,
  periodSelection: false
};