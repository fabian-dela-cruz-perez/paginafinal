import React, { useState } from "react";

function SimpleSearchBar({ onSearch }) {
  const [searchValue, setSearchValue] = useState("");

  const handleInputChange = (e) => {
    setSearchValue(e.target.value);
    onSearch(e.target.value); // Llama a la función onSearch cada vez que cambia el valor
  };

  return (
    <input
      type="text"
      placeholder="Buscar productos..."
      value={searchValue}
      onChange={handleInputChange}
      className="search-bar"
    />
  );
}

export default SimpleSearchBar;
