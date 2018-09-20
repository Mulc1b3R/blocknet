import React, { Component } from 'react'
import PerfectScrollbar from 'perfect-scrollbar'
import Chart from 'chart.js'
import { Msg, msg2str } from './Message'

/********** Main Screen and Panels ************/
/*Header navigation bar*/
export class Header extends Component {
    constructor(props) {
        super(props);
        this.claimTokens = this.claimTokens.bind(this);
    }

    claimTokens() {
        this.props.claimTokens();
    }

    render() {
        return (
            <div className="header">
                <h1 className="title text-unselectable hover-cursor">BLOCK NET >></h1>
                <TokenManager claimTokens={this.claimTokens} state={this.props.state} />
                <nav className="header-nav">
                    <div>
                        <a href="#">Dev Blog</a>
                    </div>
                    <div>
                        <a href="#">About Us</a>
                    </div>
                </nav>
            </div>
        );
    }
}

/**
 * Token balance
 */
export class TokenManager extends Component {
    constructor(props) {
        super(props);
        this.claimTokens = this.claimTokens.bind(this);
    }

    claimTokens() {
        this.props.claimTokens();
    }

    refreshBalance(e) {
        e.preventDefault();
        this.forceUpdate();
    }

    render() {
        return (
            <div className="token-manager">
                <p className="token-balance">Balance: {this.props.state.balance}</p>
                <button onClick={this.claimTokens}>Claim Tokens</button>
                <button onClick={(e) => { this.refreshBalance(e) }}>Refresh</button>
            </div>
        );
    }
}

/**
 * Page body High level elements of the page body, i.e. the left and right panels and selected content.
 */
export class MainPage extends Component {
    constructor(props) {
        super(props);
        this.state = { activeSection: "Rooms" };
        this.activateSection = this.activateSection.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
        this.dequeueMessage = this.dequeueMessage.bind(this);
    }

    activateSection(sectionName) {
        this.setState({ activeSection: sectionName });
    }

    sendMessage(message) {
        this.props.sendMessage(message);
    }

    dequeueMessage() {
        this.props.dequeueMessage();
    }

    render() {
        return (
            <div className="main-page">
                <div className="main-screen">
                    <LeftPanel onSectionClick={this.activateSection} activeSection={this.state.activeSection} />
                    <Content
                        section={this.state.activeSection}
                        sendMessage={this.sendMessage}
                        latestMessage={this.props.latestMessage}
                        queuedMessageFlag={this.props.queuedMessageFlag}
                        dequeueMessage={this.props.dequeueMessage}
                    />
                    <RightPanel />
                </div>
            </div>
        );
    }
}

/*Left panel containing sections for main sections of application*/
export class LeftPanel extends Component {
    constructor(props) {
        super(props);
        this.activateSection = this.activateSection.bind(this);
    }
    activateSection(sectionName) {
        this.props.onSectionClick(sectionName);
    }
    render() {
        return (
            <div className="left-panel">
                <SectionButton sectionName="Rooms"
                    onSectionClick={this.activateSection}
                    activeSection={this.props.activeSection} />
                <SectionButton sectionName="Messages"
                    onSectionClick={this.activateSection}
                    activeSection={this.props.activeSection} />
                <SectionButton sectionName="Console"
                    onSectionClick={this.activateSection}
                    activeSection={this.props.activeSection} />
                <SectionButton sectionName="Settings"
                    onSectionClick={this.activateSection}
                    activeSection={this.props.activeSection} />
            </div>
        )
    }
}

/**
 * Button in side panel that routes to the main sections of the site
 */
export class SectionButton extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {
        console.log(this.props.sectionName + " was clicked.")
        this.props.onSectionClick(this.props.sectionName);
    }
    render() {
        let selectedStatus = "unselected-section";
        //console.log("active: {" + this.props.activeSection + "}| this: {" + this.props.sectionName + "}");
        if (this.props.activeSection === this.props.sectionName) {
            selectedStatus = "selected-section";
        }
        var classes = `${selectedStatus} section-button text-unselectable`;

        return (
            <div className={classes} onClick={(e) => this.handleClick(e)}>
                {this.props.sectionName}
            </div>
        );
    }
}

/*Right panel, for stylistic purposes (acting as a border for now)
    -content: unsure for now, icons could potentially be added
*/
export class RightPanel extends Component {
    render() {
        return (
            <div className="right-panel">

            </div>
        )
    }
}

/**
 * Rooms and Messages
 * */
export class Content extends Component {
    constructor(props) {
        super(props);
        this.sendMessage = this.sendMessage.bind(this);
        this.dequeueMessage = this.dequeueMessage.bind(this);
    }

    sendMessage(message) {
        this.props.sendMessage(message);
    }

    dequeueMessage() {
        this.props.dequeueMessage();
    }

    render() {
        switch (this.props.section) {
            case "Rooms":
                return (
                    <RoomScreen
                        sendMessage={this.sendMessage}
                        latestMessage={this.props.latestMessage}
                        queuedMessageFlag={this.props.queuedMessageFlag}
                        dequeueMessage={this.props.dequeueMessage}
                    />
                );
            case "Messages":
                return (
                    <div className="content">
                        <PrivateChatsScreen />
                    </div>
                );
            case "Settings":
                return (
                    <div className="content">
                        <SettingsScreen />
                    </div>
                );
            case "Console":
                return (
                    <div className="content">
                        <Console />
                    </div>
                );
        }
    }
}

/**
 * Main room screen containing the room navigation menu, message list and chat box
 */
export class RoomScreen extends Component {
    constructor(props) {
        super(props);
        this.child = React.createRef();
        this.state = {
            lastMessage: '',
            activeRoom: "Block Net"
        };
        this.updateMessage = this.updateMessage.bind(this);
        this.activateRoom = this.activateRoom.bind(this);
        this.dequeueMessage = this.dequeueMessage.bind(this);
    };

    /*This is the point where we will want to give the to-be-activated room name to the backend for it to send back messages*/
    activateRoom(roomName) {
        this.setState({ activeRoom: roomName });
    }

    //Calls the addMessage function from MessageContainer
    updateMessage(msg) {
        //this.setState({ lastMessage: msg });
        //this.child.current.addMessage(msg);
        this.sendMessageToBlock(msg);
    }

    componentDidUpdate() {
        if (this.props.queuedMessageFlag) {
            this.setState({ lastMessage: this.props.latestMessage });
            this.child.current.addMessage(this.props.latestMessage);
            this.dequeueMessage();
        }
    }

    sendMessageToBlock(msg) {
        this.props.sendMessage(msg);
    }

    dequeueMessage() {
        this.props.dequeueMessage();
    }

    //Bind message container to this.child so that the addMessage
    //function from MessageContainer can be accessed in updateMessage
    render() {
        return (
            <div className="room-screen">
                <RoomNav onRoomButtonClick={this.activateRoom}
                    activeRoom={this.state.activeRoom} />
                <MessageContainer
                    ref={this.child}
                    atestMessage={this.props.latestMessage}
                    queuedMessage={this.props.queuedMessage}
                    dequeueMessage={this.props.dequeueMessage}
                />
                <ChatBox updateMessage={(e) => this.updateMessage(e)} />
            </div>
        );
    }
}

/*
 * Contains all the messages
 */
export class RoomNav extends Component {
    constructor(props) {
        super(props);
        this.activateRoom = this.activateRoom.bind(this);
    }
    activateRoom(roomName) {
        this.props.onRoomButtonClick(roomName);
    }
    render() {
        return (
            <div className="room-nav text-unselectable">
                <RoomButton roomName="Block Net"
                    onRoomButtonClick={this.activateRoom}
                    activeRoom={this.props.activeRoom} />
                <RoomButton roomName="Programming"
                    onRoomButtonClick={this.activateRoom}
                    activeRoom={this.props.activeRoom} />
                <RoomButton roomName="Gaming"
                    onRoomButtonClick={this.activateRoom}
                    activeRoom={this.props.activeRoom} />
                <RoomButton roomName="Work"
                    onRoomButtonClick={this.activateRoom}
                    activeRoom={this.props.activeRoom} />
                <RoomButton roomName="Lifestyle"
                    onRoomButtonClick={this.activateRoom}
                    activeRoom={this.props.activeRoom} />
            </div>
        );
    }
}

/**
 * Button for rooms. Changes colour according to whether selected or not 
 */
export class RoomButton extends Component {
    constructor(props) {
        super(props);
        this.handleClick = this.handleClick.bind(this);
    }
    handleClick() {
        this.props.onRoomButtonClick(this.props.roomName)
    }
    render() {
        let selectedStatus = "unselected-room-button";
        //console.log("this: " + this.props.roomName + "| active: " + this.props.activeRoom)
        if (this.props.activeRoom === this.props.roomName) {
            selectedStatus = "selected-room-button";
        }
        let classes = `${selectedStatus}`
        return (
            <div className={classes} onClick={(e) => this.handleClick(e)}>
                {this.props.roomName}
            </div>
        );
    }
}

export class MessageContainer extends Component {
    constructor(props) {
        super(props);
        this.state = {
            messages: []
        };
        this.dequeueMessage = this.dequeueMessage.bind(this);
        this.addMessage = this.addMessage.bind(this);
    };

    componentDidMount() {
        const container = document.querySelector('.scroll-container');
        const scrollbar = new PerfectScrollbar(container, {
            wheelSpeed: 2,
            wheelPropagation: true,

        });
    }

    dequeueMessage() {
        this.props.dequeueMessage();
    }

    //Create a new variable containing the message and a unique key
    //and add it to the messages list
    addMessage(message) {
        var newMessage = {
            data: message,
            key: Date.now()
        }

        this.setState((prevState) => {
            return {
                messages: prevState.messages.concat(newMessage)
            };
        });
    }

    //Helper method for render to render every value in the messages list
    renderMessages() {
        return this.state.messages.map(message => {
            //return <Message key={message.key} msg={message.data}/>
            return <Message key={message.key} msg={message.data} />
        });
    }

    render() {
        return (
            <div className="scroll-container">
                <div className="message-container">
                    {this.renderMessages()}
                </div>
            </div>
        );
    }
}

/*
 * Renders the header of the message, containing the username
 * and sent time, and the content, which contains the actual message
 */
export class Message extends Component {
    constructor(props) {
        super(props);
        console.log(this.props)
    };

    render() {
        return (
            <div className="message">
                <MessageHeader />
                <MessageContent msg={this.props.msg} />
            </div>
        );
    }
}

export class Menu extends Component {
    constructor() {
        super();

        this.state = {

            showMenu: false,
        };

        this.showMenu = this.showMenu.bind(this);
        this.closeMenu = this.closeMenu.bind(this);
    }

    showMenu(event) {
        event.preventDefault();

        this.setState({ showMenu: true }, () => {
            document.addEventListener('click', this.closeMenu);
        });
    }

    closeMenu(event) {

        if (!this.dropdownMenu.contains(event.target)) {

            this.setState({ showMenu: false }, () => {
                document.removeEventListener('click', this.closeMenu);
            });

        }
    }
}

export class MessageHeader extends Menu {
    render() {
        return (
            <div className="message-header">
                <div className="composer" onClick={this.showMenu}>
                    <h3 className="message-username hover-hand hover-cursor"> #123321</h3>
                    {/* <!-- <button className="invite-button hover-cursor"> Invite </button> -->*/}

                    <div className="invite-menu hover-hand hover-cursor">

                        {
                            this.state.showMenu
                                ? (
                                    <div

                                        ref={(element) => {
                                            this.dropdownMenu = element;
                                        }}
                                    >
                                        <button className="inner-invite-menu" n> Invite to private chat  </button>
                                        <button className="inner-invite-menu"> Invite Someone to this room </button>
                                        <button className="inner-invite-menu"> Mute  </button>
                                    </div>
                                )
                                : (
                                    null
                                )
                        }
                    </div>
                </div>
                <h3 className="message-time hover-cursor">Jan 1, 12:33 PM</h3>
            </div>
        );
    }
}

/*
 * Contains the text for the messages
 */
export class MessageContent extends Component {
    constructor(props) {
        super(props);
    };

    render() {
        return (
            <p className="message-content hover-cursor">
                {this.props.msg}
            </p>
        );
    }
}

/*
 * ChatBox for typing and sending message
 */
export class ChatBox extends Component {
    constructor(props) {
        super(props);
        this.state = {
            value: ''
        };
        this.handleChange = this.handleChange.bind(this);
        this.handleSubmit = this.handleSubmit.bind(this);
        this.onEnterPress = this.onEnterPress.bind(this);
    }

    //Update value when ever it is changed in the textarea
    handleChange(e) {
        this.setState({ value: e.target.value });
    }

    //Send message to the parent component, RoomScreen, and reset value to ''
    handleSubmit(e) {
        e.preventDefault();
        //var thisMessage = this.state.value;
        var thisMessage = Msg("", this.state.value);
        this.props.updateMessage(thisMessage);
        this.setState({ value: '' });
    }

    onEnterPress(e) {
        if (e.keyCode == 13 && e.shiftKey == false) {
            e.preventDefault();
            this.handleSubmit(e);
        }
    }

    render() {
        return (
            <div className="chat-box">
                <form onSubmit={(e) => this.handleSubmit(e)}
                    ref={formRef => this.myFormRef = formRef}>
                    <textarea cols="1" placeholder="Enter message..."
                        value={this.state.value}
                        onChange={this.handleChange}
                        onKeyDown={(e) => this.onEnterPress(e)} />
                    <input className="chat-box-send" type="submit" value="Send" />
                </form>
            </div>
        );
    }
}

/**
 * Private Messages
 */
export class PrivateChatsScreen extends Component {
    render() {
        return (
            <div className="private-messages-screen">
                <p>Private messaging is a work in progress.</p>
            </div>
        );
    }
}

/**
 * Settings
 */
export class SettingsScreen extends Component {
    render() {
        return (
            <div className="settings-screen content">
                <p>Settings is a work in progress.</p>
            </div>
        );
    }
}

/**
 * Console
 */
export class Console extends Component {
    render() {
        return (
            <div className="console">
                <div className="console-top">
                    <Properties />
                    <MessageGraph />
                </div>
                <div className="console-bottom">
                    <ConsoleLog />
                </div>
            </div>
        );
    }
}

export class Properties extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <div className="properties">
                <div className="properties-title">
                    <h4> Properties </h4>
                </div>
                <div className="properties-content">
                    <p>account address: 0x6c568c66b75259fa8b47853cD56aF396b728FBE5</p>
                    <p>local ipfs hash: QmT4owZoqCLUMyai8qGtAKFYbEjg1su3KfvzqoE8vkDy9U</p>
                    <p>ipfs swarm address: /dns4/ws-star.discovery.libp2p.io/tcp/443/wss/p2p-websocket-star/ipfs/QmT4owZoqCLUMyai8qGtAKFYbEjg1su3KfvzqoE8vkDy9U</p>
                    <p>claimableTokens: 96</p>
                    <p>latestBlockNo: 3021384</p>
                    <p>tokensPerMessage: 3</p>
                    <p>dailyTokensNo: 12</p>
                    <p>blocksPerClaim: 100</p>
                    <p>balance: 6</p>
                    <p>messageHistory: 3020577</p>
                    <p>blocksTilClaim: 0</p>
                </div>
            </div>
        );
    }
}

export class MessageGraph extends Component {
    constructor(props) {
        super(props);
        Chart.defaults.global.responsive = true;
        Chart.defaults.global.scaleStartValue = 0;
        this.state = {
            LineChart: require("react-chartjs").Line,
            data: {
                labels: ["2am", "4am", "6am", "8am", "10am",
                    "12pm", "2pm"],
                datasets: [
                    {
                        label: "Messages",
                        fillColor: "rgba(220,220,220,0.2)",
                        strokeColor: "rgba(220,220,220,1)",
                        pointColor: "rgba(220,220,220,1)",
                        pointStrokeColor: "#fff",
                        pointHighlightFill: "#fff",
                        pointHighlightStroke: "rgba(220,220,220,1)",
                        //Create random data to fill graph
                        data: this.rand(100, 300, 7),
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

    }

    //Placeholder to create random data
    rand(min, max, num) {
        var rtn = [];
        while (rtn.length < num) {
            rtn.push(Math.round((Math.random() * (max - min)) + min));
        }
        return rtn;
    }

    render() {
        return (
            <div className = "graphbox">
                <div className="graph-title">
                    <h2> #No. of Messages sent in last 12 Hours </h2>
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

export class ConsoleLog extends Component {
    constructor(props) {
        super(props);
        this.state = {
        }
    }

    render() {
        return (
            <div className="consolelog">
                <div className="consolelog-title">
                    <h3> Log </h3>
                </div>
                <div className="consolelog-content">
                    <p>>Loading Components...</p>
                    <p>>Using address >> 0x6c568c66b75259fa8b47853cD56aF396b728FBE5</p>
                    <p>>Metamask acount loaded...</p>
                    <p>>Connection to Rinkeby Test Network established</p>
                    <p>>IPFS initialized >> Using IPFS local hash QmT4owZoqCLUMyai8qGtAKFYbEjg1su3KfvzqoE8vkDy9U</p>
                    <p>>Updating Blockchain... Receiving latest messages</p>
                    <p>>Block #3021383, Block #3021384 downladed</p>
                    <p>>Blockchain verified...</p>
                    <p>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>></p>
                    <p>>Block #3021384 has been verified by ethereum network</p>
                    <p>>Client transmitting message to block #3021385</p>
                    <p>>Block #3021385 currently 50% full</p>
                    <p>>Expected wait time till message is sent ~2 minutes</p>
                    <p>></p>
                    <p>></p>
                    <p>></p>
                    <p>></p>
                    <p>></p>
                    <p>></p>
                </div>
            </div>
        );
    }
}
