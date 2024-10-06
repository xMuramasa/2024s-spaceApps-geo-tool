import Button from 'react-bootstrap/Button';
import Modal from 'react-bootstrap/Modal';

function ModalComponent({ title, show, setShow, children }) {

  const handleClose = () => setShow(false);

  return (
    <Modal
      className='modal-data'
      show={show}
      onHide={handleClose}
      size={"lg"}
    >
      <Modal.Header closeButton>
        <Modal.Title>
          <>
            {title ? title : ''}
          </>
        </Modal.Title>
      </Modal.Header>
      <Modal.Body>
        {children}
      </Modal.Body>
      <Modal.Footer>
        <Button variant="secondary" onClick={handleClose}>
          Close
        </Button>
        <Button variant="primary" onClick={handleClose}>
          Ok!
        </Button>
      </Modal.Footer>
    </Modal>
  );
}

export default ModalComponent;