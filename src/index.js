import React, { Component } from 'react';
import moment from 'moment';
import { isSameDate, isDisabled } from './utils/utils';

export default class ScrollCalendar extends Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedDate: null
    };

    this.handleSelectedDate = this.handleSelectedDate.bind(this);
    this.setSelectedDate = this.setSelectedDate.bind(this);
  }

  handleSelectedDate(e, value) {
    e && e.preventDefault();
    this.setSelectedDate(value);
    if (this.props.onSelect) {
      this.props.onSelect(value);
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
      selectedDate: this.state.selectedDate,
      handleSelect: this.handleSelectedDate,
      className: this.props.className + ' mobile-datepicker',
      yearFormat: this.props.yearFormat,
      monthFormat: this.props.monthFormat,
      enableYearTitle: this.props.enableYearTitle,
      enableMonthTitle: this.props.enableMonthTitle,
      weekStartsOnMonday: this.props.weekStartsOnMonday === undefined ? false : this.props.weekStartsOnMonday,
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
  let now = props.currentMonth;
  return (
    <section className="month" id={now.format('MMMM-YYYY')}>
      <RenderMonthHeader date={now} {...props}/>
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
  handleClick,
  currentValue,
  isDisabled,
  i
}) => {
  let className = '' + (isActive ? 'active' : '') + (isDisabled ? 'disabled' : '')
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
  selectedDate,
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
  let startDate = date.startOf('month');
  let balanceDayCount = getDay(startDate);

  let renderDay = () => {
    let elements = [];
    let now = moment(date, 'DD/MMM/YYYY');
    for (let i = 1; i <= daysInMonth; i++) {
      elements.push(
        <RenderSingleDay
          isActive={isSameDate(now.clone(), selectedDate)}
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
  enableMonthTitle: true
};