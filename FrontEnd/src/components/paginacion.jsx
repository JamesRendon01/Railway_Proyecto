import React from "react";
import { Pagination } from "antd";
import "antd/dist/reset.css";

const Paginacion = ({ current, total, pageSize, onChange }) => {
  return (
    <div className="flex flex-col items-center mb-20">
      <Pagination
        current={current}
        onChange={onChange}
        total={total}
        pageSize={pageSize}
        className="bg-white rounded shadow"
      />
    </div>
  );
};

export default Paginacion;
