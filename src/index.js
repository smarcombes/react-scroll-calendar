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
    this.state = {
      selectionState: PERIOD_SELECTION_STATES.NO_SELECTION,
      startDate: null,
      endDate: null,
    };

    this.handleSelectedDate = this.handleSelectedDate.bind(this);
    this.setSelectedDate = this.setSelectedDate.bind(this);
  }

  handleSelectedDate(e, value) {
    e && e.preventDefault();
    if(!this.props.periodSelection ||(
      this.state.selectionState === PERIOD_SELECTION_STATES.NO_SELECTION ||
      this.state.selectionState === PERIOD_SELECTION_STATES.PERIOD_SELECTED)) {
      this.setState({
        selectionState: PERIOD_SELECTION_STATES.ONE_DATE_SELECTED,
        startDate: value,
        endDate: undefined,
      });
      if(this.props.onSelect) {
        this.props.onSelect(value);
      }
    } else if(this.state.selectionState === PERIOD_SELECTION_STATES.ONE_DATE_SELECTED) {
      const { startDate } = this.state;
      if(startDate.isBefore(value)) {
        this.setState({
          selectionState: PERIOD_SELECTION_STATES.PERIOD_SELECTED,
          endDate: value,
        });
        if(this.props.onSelect) {
          this.props.onSelect({
            startDate: startDate,
            endDate: value,
          });
        }
      } else if(startDate.isAfter(value)) {
        this.setState({
          selectionState: PERIOD_SELECTION_STATES.PERIOD_SELECTED,
          startDate: value,
          endDate: startDate,
        });
        if(this.props.onSelect) {
          this.props.onSelect({
            startDate: value,
            endDate: startDate,
          });
        }
      }
    }
  }

  setSelectedDate(date) {
    this.setState({
      selectedDate: date
    });
  }

  componentDidMount() {
    this.setSelectedDate(this.props.selectedDate);
    let element = document.getElementById(
      moment(this.props.selectedDate, 'DD/MMM/YYYY').format('MMMM-YYYY')
    );
    if (element) {
      element.scrollIntoView();
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
      startDate: this.state.startDate,
      endDate: this.state.endDate,
      handleSelect: this.handleSelectedDate,
      className: this.props.className + ' mobile-datepicker',
      yearFormat: this.props.yearFormat,
      monthFormat: this.props.monthFormat,
      enableYearTitle: this.props.enableYearTitle,
      enableMonthTitle: this.props.enableMonthTitle,
      weekStartsOnMonday: this.props.weekStartsOnMonday === undefined ? false : this.props.weekStartsOnMonday,
      renderMonthHeader: this.props.renderMonthHeader,
      periodSelection: this.props.periodSelection,
    };
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
  handleClick,
  currentValue,
  isDisabled,
  i
}) => {
  let className = (
    '' + (isActive ? 'active' : '') +
    (isDisabled ? 'disabled' : '') +
    (isInSelectedPeriod ? ' active-period' : '')
  );
  return (
    <li
      className={className}
      key={i}
    >
      <span onClick={e => handleClick(e, currentValue)}>{currentValue.date()}</span>
    </li>
  );
};

export const RenderDays = ({
  date,
  startDate,
  endDate,
  handleSelect,
  minDate,
  maxDate,
  weekStartsOnMonday
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

  let renderDay = () => {
    let elements = [];
    let now = moment(date, 'DD/MMM/YYYY');
    for (let i = 1; i <= daysInMonth; i++) {
      elements.push(
        <RenderSingleDay
          isInSelectedPeriod={now.isSameOrAfter(startDate) && now.isSameOrBefore(endDate)}
          isActive={isSameDate(now.clone(), startDate) || isSameDate(now.clone(), endDate)}
          isDisabled={isDisabled(minDate, now.clone(), maxDate)}
          handleClick={handleSelect}
          currentValue={now.clone()}
          key={i}
        />
      );
      now = now.add(1, 'days');
    }
    return elements;
  };
  let renderUnwantedDay = balanceDayCount => {
    let elements = [];
    for (let i = 0; i < balanceDayCount; i++) {
      elements.push(<li className="visible-hidden" key={i} />);
    }
    return elements;
  };
  return (
    <ul className="date">
      {renderUnwantedDay(balanceDayCount)}
      {renderDay()}
    </ul>
  );
};

ScrollCalendar.defaultProps = {
  minDate: moment().add(1, 'd'),
  maxDate: moment().add(9, 'M'),
  selectedDate: null,
  monthFormat: 'MMMM',
  yearFormat: 'YYYY',
  enableYearTitle: true,
  enableMonthTitle: true,
  periodSelection: false
};