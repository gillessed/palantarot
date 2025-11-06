import React from "react";
import { IMonth } from "../../../server/model/Month";
import moment from "moment";
import { Button } from "@blueprintjs/core";
import { ResultsTabs } from "./ResultsTabs";
import { pageCache } from "../pageCache/PageCache";

interface State {
  month: IMonth;
}

class ResultsContainerInternal extends React.PureComponent<{}, State> {
  constructor(props: {}) {
    super(props);
    this.state = {
      month: IMonth.now(),
    };
  }

  public render() {
    return (
      <div className="results-container page-container">
        <div className="results-header">
          <Button icon="chevron-left" large onClick={this.previousMonth} />
          <div className="title">
            <h1 className="bp3-heading" style={{ textAlign: "center" }}>
              Results for {this.state.month.getHumanReadableString()}
            </h1>
          </div>
          <Button icon="chevron-right" large onClick={this.nextMonth} disabled={this.isCurrentMonth()} />
        </div>
        <ResultsTabs results={this.state.month} month={this.state.month} />
      </div>
    );
  }

  private isCurrentMonth() {
    return moment().year() === this.state.month.year && moment().month() === this.state.month.month;
  }

  private previousMonth = () => {
    this.setState({
      month: this.state.month.previous(),
    });
  };

  private nextMonth = () => {
    if (this.isCurrentMonth()) {
      return;
    }
    this.setState({
      month: this.state.month.next(),
    });
  };
}

export const ResultsContainer = pageCache(ResultsContainerInternal);
