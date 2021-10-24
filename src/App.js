import { useState } from "react";
import {
  Container,
  Row,
  Col,
  Accordion,
  Card,
  ListGroup,
  CardGroup,
  Button,
} from "react-bootstrap";
import "./App.css";
import Axios from "axios";
import fileDownload from "js-file-download";
import env from "react-dotenv";

function App() {
  const [state, setState] = useState([]);
  const [token, setToken] = useState("");

  const authFunction = async () => {
    let auth = await Axios.post(
      "https://api.fynbill.fynbird.io/oauth",

      {
        username: process.env.REACT_APP_API_USERNAME,
        password: env.PASSWORD,
        client_id: process.env.REACT_APP_API_CLIENT_ID,
        client_secret: process.env.REACT_APP_API_CLIENT_SECRET,
        grant_type: process.env.REACT_APP_API_GRANT_TYPE,
      }
    )
    setToken(auth.data.access_token);
  };

  const getInvoices = async () => {
    try {
      authFunction();
      const config = {
        headers: { Authorization: `Bearer ${token}` },
      };

      const res = await Axios.get(
        "https://api.fynbill.fynbird.io/v1/invoices/debit/list?page=5&limit=25",
        config
      );
      setState(res.data._embedded.list_debits);
    } catch (error) {
      console.log(error);
    }
  }

  if (state.length === 0) {
    getInvoices();
  }

  const handleDownload = async (url, filename) => {
    const config = {
      headers: { Authorization: `Bearer ${token}` },
      responseType: "blob"
    };

    await Axios.get(url,config).then((res) => {
      fileDownload(res.data, filename);
    });
  };

  return (
    <Container>
      <Row>
        <Col xl={12} className="m-5 p-2">
          <Container className="px-2">
            <Row style={{ height: "50px" }}>
              <div className="col-2 pt-3 bg-primary text-light border">
                Invoice number
              </div>
              <div className="col-2 pt-3 bg-primary text-light border">
                Receipt Date
              </div>
              <div className="col-2 pt-3 bg-primary text-light border">
                Netto Amount{" "}
              </div>
              <div className="col-2 pt-3 bg-primary text-light border">
                Service Period
              </div>
              <div className="col-2 pt-3 bg-primary text-light border">
                Brutto Amount
              </div>
              <div className="col-2 pt-3 bg-primary text-light border">
                Debitor
              </div>
            </Row>
          </Container>
          <Accordion>
            {state.map((item, index) => {
              return (
                <Accordion.Item eventKey={index} key={index}>
                  <Accordion.Header>
                    <Container>
                      <Row>
                        <div className="col-2"> {item.billing_number} </div>
                        <div className="col-2"> {item.receipt_date} </div>
                        <div className="col-2">{item.netto}</div>
                        <div className="col-2"> {item.service_period}</div>
                        <div className="col-2">{item.brutto}</div>
                        <div className="col-2">{item.Debitor.name}</div>
                      </Row>
                    </Container>
                  </Accordion.Header>
                  <Accordion.Body className="bg-secondary">
                    <CardGroup>
                      <Card style={{ width: "18rem" }} className="m-3">
                        <Card.Header>
                          Receipt Date: {item.receipt_date}
                        </Card.Header>
                        <ListGroup className="text-capitalize" variant="flush">
                          <ListGroup.Item>
                            Netto amount : {item.netto}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            Service period: {item.service_period}
                          </ListGroup.Item>
                          <ListGroup.Item>
                            Due Date: {item.due_date}
                          </ListGroup.Item>

                          <ListGroup.Item>Brutto: {item.brutto}</ListGroup.Item>
                          <ListGroup.Item>
                            Balance: {item.balance}
                          </ListGroup.Item>
                        </ListGroup>
                      </Card>
                    </CardGroup>
                    <CardGroup>
                      <h4 className="w-100 m-0">Items</h4>
                      {item.items.map((element, id) => {
                        return (
                          <Card
                            key={id}
                            style={{ width: "18rem" }}
                            className="m-3"
                          >
                            <Card.Header>
                              Description: {element.description}{" "}
                            </Card.Header>
                            <ListGroup variant="flush">
                              <ListGroup.Item className="text-capitalize">
                                Amount: {element.amount}
                              </ListGroup.Item>
                              <ListGroup.Item>
                                Sum: {element.sum}
                              </ListGroup.Item>
                              <ListGroup.Item className="text-capitalize">
                                price: {element.price}
                              </ListGroup.Item>
                              <ListGroup.Item className="text-capitalize">
                                vat-rate: {element.vat_rate}
                              </ListGroup.Item>
                            </ListGroup>
                          </Card>
                        );
                      })}
                    </CardGroup>
                    <Button
                      className="w-100 bg-info border-info"
                      onClick={() =>
                        handleDownload(item.file.file_url, item.file.filename)
                      }
                    >
                      Download this invoice as pdf
                    </Button>
                  </Accordion.Body>
                </Accordion.Item>
              );
            })}
          </Accordion>
        </Col>
      </Row>
    </Container>
  );
}

export default App;
