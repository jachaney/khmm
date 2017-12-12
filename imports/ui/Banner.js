import React from 'react';

export default class Banner extends React.Component {

  render() {
    return (
      <div>
        <div className="item__top">
          <img src={this.props.image}
            alt="kh image goes here" className="item-main-banner"/>
          <h1>{this.props.title}</h1>
        </div>
      </div>
    )
  }
};
