/* global EM */
import React, { Component } from 'react';
import { Button, Modal, ModalHeader, ModalBody, ModalFooter } from 'reactstrap';
import FullCalendar from '@fullcalendar/react'
import googleCalendarPlugin from '@fullcalendar/google-calendar';
import dayGridPlugin from '@fullcalendar/daygrid';
import listPlugin from '@fullcalendar/list';

export default class Home extends Component {
    constructor(props) {
        super(props);

        this.key = EM.getQs('key');
        this.dtdcId = "9hsi23n792il4r2fpnk08kmnj8@group.calendar.google.com";
        this.dvdcId = "88nt7fbcnbvdk7q5ojngskd2rc@group.calendar.google.com";

        this.state = {
            currentEvent: null
        };

        this.electionDates = EM.electionDates.map((ed, index) => {
            return Object.assign({}, ed, { color: '#d03b3b', id: 'e' + index, className: 'election' });
        });

        this.holidays = EM.holidays.map((holiday, index) => {
            return Object.assign({}, holiday, { color: '#ccc', id: 'h' + index, className: 'holiday' });
        });        

        this.onClose = this.onClose.bind(this);
    }

    onClose() {
        this.setState({ currentEvent: null });
    }

    render() {
        return (
            <div key="contents" className="page page-home container-fluid">
                <FullCalendar
                    defaultView="listMonth"
                    height="parent"
                    header={{
                        left: 'prev,next today',
                        center: 'title',
                        right: 'listMonth,dayGridMonth,dayGridWeek'
                    }}
                    buttonText={{
                        today: 'Today',
                        month: 'Month',
                        week: 'Week',
                        day: 'Day',
                        list: 'List'
                    }}
                    plugins={[googleCalendarPlugin, dayGridPlugin, listPlugin]}
                    googleCalendarApiKey={this.key}
                    eventSources={[
                        this.electionDates,
                        this.holidays,
                        {
                            googleCalendarId: this.dtdcId,
                            className: 'dtdc',
                            id: 'dtdc',
                            color: "#f7c121",                            
                        },
                        {
                            googleCalendarId: this.dvdcId,
                            className: 'dvdc',
                            id: 'dvdc',
                            color: "#27aff3",                            
                        }
                    ]}
                    eventClick={(info) => {
                        info.jsEvent.preventDefault();
                        if (info.event.extendedProps){
                            if (info.event.extendedProps.description || info.event.extendedProps.location)
                                this.setState({ currentEvent: info.event });
                        }
                    }}
                />
                {this.state.currentEvent ? 
                    <Modal isOpen={this.state.currentEvent?true:false} toggle={this.onClose}>
                        <ModalHeader toggle={this.toggle}>{this.state.currentEvent.title}</ModalHeader>
                        <ModalBody>     
                            <h5>Description:</h5>                      
                            <div dangerouslySetInnerHTML={{ __html: this.state.currentEvent.extendedProps.description }} />
                            <hr/>
                            <h5>Location:</h5>
                            <div dangerouslySetInnerHTML={{ __html: this.state.currentEvent.extendedProps.location }} />
                        </ModalBody>
                        <ModalFooter>
                            <Button color="secondary" onClick={this.onClose}>Close</Button>
                        </ModalFooter>
                    </Modal>
                : null }
            </div>
        );
    }
}
