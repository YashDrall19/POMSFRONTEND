
export default function Modal({showModal, title, onclose, content, size = "lg"}) {
  return (
    <div className={`modal fade ${showModal ? "show d-block" : ""}`} style={{ backgroundColor: "rgba(0, 0, 0, 0.5)" }}>
        <div className={`modal-dialog modal-${size}`} style={{width: "90vw"}}>
            <div className="modal-content">
                <div className="modal-header">
                  <h5 className="modal-title">{title || "Modal"}</h5>
                  <button type="button" className="btn-close" onClick={onclose}></button>
                </div>
                <div>
                    {content}
                </div>
            </div>
        </div>
    </div>
  )
}
