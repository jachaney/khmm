import React from 'react';
import createHistory from 'history/createBrowserHistory';

const history = createHistory();

export default class Banner extends React.Component {

  render() {
    return (
      <div>
        <div className="item__top">
          <img src={this.props.image}
            alt="kh image goes here" height="200" width="200"/>
          <h1>{this.props.title}</h1>
        </div>
      </div>
    )
  }
};
