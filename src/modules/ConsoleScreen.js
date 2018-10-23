import React, { Component } from 'react'
import Chart from 'chart.js'
import getTime from './../utils/getTime'

/**
 * Console
 */
export class ConsoleScreen extends Component {
    constructor(props) {
        super(props);
        this.currentState = this.props.currentState;
        //console.log(this.currentState);
        this.activateSection = this.activateSection.bind(this);
        this.state = {activeSection: "Log", consoleHeight : "50%" ,mousedrag:"0"};
        

    }

    activateSection(section) {
        this.setState({ activeSection: section});
    }

    mouseMove(e){
        if(this.state.mousedrag == "1") {
            var newHeight = 20 + window.innerHeight - e.pageY;
            this.setState({consoleHeight: newHeight}); 
        }
    }

    mouseDown(e) {
        this.setState({mousedrag: "1"});
    }

    mouseUp(e){
        this.setState({mousedrag: "0"});
    }

    render() {
        if (this.props.consoleActive) {
            return (
                //<div className={classes}>
                <div className="console console-active" 
                        style = {{height: this.state.consoleHeight}}>
                    <ConsoleNav 
                        onMouseMove={(e) => this.mouseMove(e)}
                        onMouseDown={(e) => this.mouseDown(e)}
                        onMouseUp={(e) => this.mouseUp(e)}
                        activeSection={this.state.activeSection}
                        activateSection={this.activateSection}
                        consoleHeight={this.consoleHeight}
                    />
                    <ConsoleContent 
                        swarmAddr={() => this.props.swarmAddr()}
                        currentState={this.currentState}
                        activateSection={this.activateSection}
                        activeSection={this.state.activeSection}
                        backendLog={this.props.backendLog}
                    />
                </div>
            );
        } else {
            return null;
        }
    }
}

/*
 * Nav menu for console sections (properties, network, log)
 */
export class ConsoleNav extends Component {
    constructor(props) {
        super(props);
        this.activateSection = this.activateSection.bind(this);
    }
    activateSection(sectionName) {
        this.props.activateSection(sectionName);
    }

    
    render() {

        return (
            <div className="console-nav"  
                        onMouseMove={(e) => this.props.onMouseMove(e)}   
                        onMouseDown={(e) => this.props.onMouseDown(e)}
                        onMouseUp={(e) => this.props.onMouseUp(e)}>
                <ConsoleNavButton 
                    sectionName="Log" 
                    activateSection={this.props.activateSection}
                    activeSection={this.props.activeSection}
                />
                <ConsoleNavButton 
                    sectionName="Properties"
                    activateSection={this.props.activateSection}
                    activeSection={this.props.activeSection}
                />
                <ConsoleNavButton 
                    sectionName="Network"
                    activateSection={this.props.activateSection}
                    activeSection={this.props.activeSection}
                />
            </div>
        )
    }
    
    
}

class ConsoleNavButton extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }

    handleClick() {
        this.props.activateSection(this.props.sectionName);
    }

    render() {
        let classes;
        if (this.props.activeSection === this.props.sectionName) {
            classes = `unselected-button`;
        } else {
            classes = `selected-button`;
        }

        return (
            <div className={classes} onClick={(e) => this.handleClick(e)}>
                {this.props.sectionName}
            </div>
        );
    }
}

class ConsoleContent extends Component {
    constructor(props) {
        super(props);
        this.currentState = this.props.currentState;
        //console.log(this.currentState);

    }

    render() {
        switch (this.props.activeSection) {
            case "Log":
                return (
                    <ConsoleLog 
                        backendLog={this.props.backendLog}
                    />
                );

            case "Properties":
                return(
                    <Properties
                    swarmAddr={() => this.props.swarmAddr()}
                    currentState={this.currentState}
                />
                );

            case "Network":
                return (
                    <MessageGraph 
                    currentState={this.currentState}/>
                );
            default:
                return(
                    <div>Something went wrong!</div>
                );
        }
    }


}
    

export class Properties extends Component {
    constructor(props) {
        super(props);
        this.currentState = this.props.currentState;
        console.log(this.currentState);
    }

   render() {
    return (
        <div className="properties console-content-section">
            <div className="properties-content">
                <p>Account Address : {this.currentState.accounts[0]}</p>
                <p>Local Ipfs Hash : {this.currentState.ipfsHash}</p>
                <p>Latest Block No : {this.currentState.latestBlockNo}</p>      
                <p>Blocks / Claim   : {this.currentState.blocksPerClaim}</p>      
                <p>Claimable Tokens: {this.currentState.claimableTokens}</p>
                <p>Tokens / Message: {this.currentState.tokensPerMessage}</p>
                <p>Daily Tokens No : {this.currentState.dailyTokensNo}</p>
                <p>Hash Contents     : {this.currentState.lastestMessage}</p>
                <p>Swarm Address    : {() => this.props.swarmAddr()}</p>
            </div>
        </div>
    );
}
}

export class MessageGraph extends Component {
    constructor(props) {
        super(props);
        this.currentState = this.props.currentState;
        Chart.defaults.global.responsive = true;
        Chart.defaults.global.scaleStartValue = 0;

        


        this.state = {
            LineChart: require("react-chartjs").Line,
            data: {
                labels: ["6hrs ago", "5hrs ago", "4hrs ago", "3hrs ago", "2hrs ago", "1h ago",
                    "0hrs ago"],
                datasets: [
                    {
                        label: "Messages",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        //Data goes below
                        data: [0,0,0,0,0,0,0],
                    },
                ]
            },
            options: {
                ///Boolean - Whether grid lines are shown across the chart
                scaleShowGridLines: true,
                //String - Colour of the grid lines
                scaleGridLineColor: "rgba(255,0,0,0.5)",
                //Number - Width of the grid lines
                scaleGridLineWidth: 1,
            }
        }
        this.updateNetworkData()
    }

    //Placeholder to create random data
    rand(min, max, num) {
        var rtn = [];
        while (rtn.length < num) {
            rtn.push(Math.round((Math.random() * (max - min)) + min));
        }
        return rtn;
    }

    updateNetworkData() {
        var currentDate = getTime().substr(7);
        var intermediate = getTime().split(",");
        intermediate.pop();
        var currentTime = intermediate.pop();
        intermediate = currentTime.split(":");
        intermediate.pop();
        var currentHour = intermediate.pop();
        var i;
        var dataValues = [0,0,0,0,0,0,0];
        for(i=0; i<this.currentState.messageHistory.length; i++) {
            var messageDate = this.currentState.messageHistory[i].date.substr(7);
            var intermediate2 = this.currentState.messageHistory[i].date.split(",");
            intermediate2.pop();
            var messageTime = intermediate2.pop();
            intermediate2 = messageTime.split(":");
            intermediate2.pop();
            var messageHour = intermediate2.pop();
            if(messageDate.localeCompare(currentDate) == 0) {
                   if((currentHour - messageHour) <= 6){
                        dataValues[currentHour - messageHour] += 1;
                   }
            }
        }
        //console.log(this.state.data.datasets)
        this.state.data =  {
                labels: ["6hrs ago", "5hrs ago", "4hrs ago", "3hrs ago", "2hrs ago", "1h ago",
                    "0hrs ago"],
                datasets: [
                    {
                        label: "Messages",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        //Data goes below
                        data: [dataValues[6], dataValues[5], dataValues[4], dataValues[3], dataValues[2], dataValues[1], dataValues[0]],
                    },
                ]
            } 
    }

    render() {
        return (
            <div className = "graphbox console-content-section">
                <div className="graph-title">
                    <h2> #No. of Messages sent in last 6 hours in this room</h2>
                </div>
                <this.state.LineChart
                    className="linegraph"
                    data={this.state.data}
                    options={this.state.options}
                />
            </div>
        );
    }
}

/**
 * Log is the log of actions that the application has performed
 *      -props.backendLog is an array that contains a log object describing the time the log was made (log.time) in 24hr time and the message to be rendered (log.message)
 */
export class ConsoleLog extends Component {
    componentDidMount() {
        var logContainer = document.getElementsByClassName("consolelog");
        logContainer[0].scrollTop = logContainer[0].scrollHeight;
    }

    renderLog() {
        let consoleParagraphs = this.props.backendLog.map((log) =>
            <LogParagraph
                time={log.time}
                message={log.message}
                waiting={log.waiting}
                indents={log.indents}
            />
        );
        return (
            consoleParagraphs
        );
    }

    render() {
        return (
            <div className="consolelog console-content-section">
                <div className="consolelog-content">
                    {this.renderLog()}
                </div>
            </div>
        );
    }
}


export class LogParagraph extends Component {
    constructor(props) {
        super(props);
        console.log(this.props.message + " | " + this.props.waiting);
        this.msg = this.props.message;
    }

    componentDidMount() {
        let logContainer = document.getElementsByClassName("consolelog");
        logContainer[0].scrollTop = logContainer[0].scrollHeight;
    }

    convertLinks(message) {

    }

    /*Links specified as: w{title||http://www.wikipedia.com/web3}w*/
    findLinks(message) {
        let startLinkCode="w{";
        let titleSeparator="||";
        let endLinkCode="}w";
        let startIndex = -1;
        let separatorIndex = -1;
        let title;
        let link;
        let chunkedMessage = [];
        let foundLink = false;
        for (let i=0; i<message.length; i++) {
            if (message[i] === startLinkCode[0] && message[i+1] === startLinkCode[1]) {
                if (startIndex === -1) {
                    //found an opening linkCode
                    startIndex = i;
                }
            }
            if (startIndex !== -1 && separatorIndex === -1) {
                //Found and opening link code but not separator yet
                if (message[i] === titleSeparator[0] && message[i+1] === titleSeparator[1]) {
                    //Found title separator; before is title, after is link
                    separatorIndex = i+titleSeparator.length;
                    title = message.substring(startIndex+startLinkCode.length, i);
                    
                }
            }
            if (message[i] === endLinkCode[0] && message[i+1] === endLinkCode[1]) {
                if (separatorIndex !== -1) {
                    //found a terminating linkCode
                    link = message.substring(separatorIndex, i);
                    chunkedMessage.push( {priorText: message.substring(0, startIndex), linkText: title, url: link} );
                    message = message.substring(i+endLinkCode.length, message.length);
                    i = 0;
                    foundLink = true;
                    startIndex = -1;
                    separatorIndex = -1;
                }
            }
        }
        if (foundLink) {
            chunkedMessage.push( {priorText: message.substring(0, message.length), linkText: "", url: ""} ); //push remainder of string to array
            return chunkedMessage
        } else {
            return false;
        }
    }

    parseMessage() {
        let msg = this.props.message; //props are immutable
        let hyperlinkMessage = this.findLinks(msg);
        let message = <span>an error occurred parsed console log message</span>;
        if (hyperlinkMessage) {
            //construct hyperlinks
            message = hyperlinkMessage.map((chunk) =>
                <span>{chunk.priorText}
                    <a href={chunk.url} target="_blank">{chunk.linkText}</a>
                </span>
            );
        } else {
            //use this.props.message
            message = <span>{this.props.message}</span>
        }

        
        let indent = [];
        for (var i=0; i<this.props.indents; i++) {
            indent.push(<span className="log-indent">....</span>)
        }
        return (
            <p>
                <span className="log-time">{this.props.time}</span>
                <span className="log-divider"> </span>
                { this.props.indents>0 && indent }
                <span className="log-message">{message}</span>
                { this.props.waiting && <WaitingAnimation /> }
            </p>
        ); 
    }

    render() {
        return (
            <div>
                {this.parseMessage()}
            </div>
        )
    }
}

export class WaitingAnimation extends Component {
    constructor(props) {
        super(props)
        this.frames = ['|', '/', '-', '\\'];
        this.state = {currentFrame: ''}
        this.index = 0;
    }

    componentDidMount() {
       this.animationID = setInterval(
           () => this.animate(),
           100
       );
    }

    animate() {
        this.setState({ currentFrame: this.frames[this.index] });
        (this.index === this.frames.length-1) ? this.index=0 : this.index++;
    }

    componentWillUnmount() {
        clearInterval(this.animationID);
    }

    render() {
        return (
            <span className="spinner">
                ...{this.state.currentFrame}
            </span>
        );
    }
}
