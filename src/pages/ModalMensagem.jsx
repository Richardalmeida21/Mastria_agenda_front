import React from "react";

const ModalMensagem = ({ mensagem, onFechar, tipo }) => {
  return (
    <div className="modal-overlay">
      <div className="modal">
        <div className={`modal-header ${tipo}`}>
          <h3>{tipo === "sucesso" ? "Sucesso!" : "Erro!"}</h3>
        </div>
        <div className="modal-body">
          <p>{mensagem}</p>
        </div>
        <div className="modal-botoes">
          <button onClick={onFechar}>Fechar</button>
        </div>
      </div>
    </div>
  );
};

export default ModalMensagem;