// src/components/customers/CustomerList.js
import React from 'react';
import { Link } from 'react-router-dom';

const CustomerList = ({ customers }) => {
  return (
    <div className="table-responsive">
      <table className="table table-striped table-hover">
        <thead className="table-primary">
          <tr>
            <th>ID</th>
            <th>Company Name</th>
            <th>Contact Person</th>
            <th>Email</th>
            <th>Actions</th>
          </tr>
        </thead>
        <tbody>
          {customers.map((customer) => (
            <tr key={customer.id}>
              <td>{customer.id}</td>
              <td>{customer.company_name}</td>
              <td>{customer.point_of_contact}</td>
              <td>
                <a href={`mailto:${customer.email}`}>{customer.email}</a>
              </td>
              <td>
                <Link to={`/customers/${customer.id}`} className="btn btn-sm btn-info me-2">
                  View
                </Link>
                <Link to={`/customers/${customer.id}/edit`} className="btn btn-sm btn-warning">
                  Edit
                </Link>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CustomerList;