import React, { useState, useContext } from "react";

import Card from "../../shared/components/UIElements/Card";
import Button from "../../shared/components/FormElements/Button";
import Modal from "../../shared/components/UIElements/Modal";
import { AuthContext } from "../../shared/context/auth-context";
// import Map from "../../shared/components/UIElements/Map";
import './PlaceItem.css';

const PlaceItem = props =>{
    const auth = useContext(AuthContext);
    
    const [showMap, setShowMap] = useState(false);
    const [showConfirmModal, setShowConfirmModal] = useState(false);

    const showDeleteWarningHandler = () => setShowConfirmModal(true);
    const cancelDeleteHandler = () => setShowConfirmModal(false);
    const confirmDeleteHandler = () => {
        console.log('DELETING...');
        setShowConfirmModal(false);
}

    const openMapHandler = () => setShowMap(true);
    const closeMapHandler = () => setShowMap(false);

    return <React.Fragment>
        <Modal show={showMap} onCancel={closeMapHandler} header={props.address} 
        contentClass="place-item__modal-content" footerClass="place-item__modal-actions" 
        footer={<Button onClick={closeMapHandler} >Close</Button>} >
            { <div className="map-container" style={{padding: "5px"}}>
                <iframe title="map" width="100%" height="100%" frameBorder="0" 
                scrolling="no" marginHeight="0" marginWidth="0" 
                src={'https://maps.google.com/maps?q='+props.coordinates.lat.toString()+','+
                props.coordinates.lng.toString()+'&t=&z=15&ie=UTF8&iwloc=&output=embed'}></iframe>
                
            </div> // this is an alternate method to add google maps without credit card. uncomment the script in index.html 
            // <div className="map-container">
            //     <Map center={props.coordinates} zoom={16} />
            // </div> // this works with the google maps api account feature
            }
        </Modal>
        <Modal show={showConfirmModal} onCancel={cancelDeleteHandler} header="Are you sure?" footerClass="place-item__modal-actions" footer={<React.Fragment>
            <Button inverse onClick={cancelDeleteHandler}>CANCEL</Button>
            <Button danger onClick={confirmDeleteHandler}>DELETE</Button>
        </React.Fragment>}>
            <p>Do you want to proceed and delete this place? Please note that it cant be recovered again.</p>
        </Modal>
        <li className="place-item">
        <Card className="place-item__content">
        <div className="place-item__image">
            <img src={props.image} alt={props.title} />
        </div>
        <div className="place-item__info">
            <h2>{props.title}</h2>
            <h3>{props.address}</h3>
            <p>{props.description}</p>
        </div>
        <div className="place-item__actions">
            <Button inverse onClick={openMapHandler} >VIEW ON MAP</Button>
            {auth.isLoggedIn && <Button to={`/places/${props.id}`}>EDIT</Button> }
            {auth.isLoggedIn && <Button danger  onClick={showDeleteWarningHandler}>DELETE</Button> }
        </div>
        </Card>
    </li>
    </React.Fragment>
}

export default PlaceItem;