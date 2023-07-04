import App from "../App";

function a() {
  return (
    <div>
      <div>
        <button className="btn-style mt-4" onClick={App.getCoinPrice}>
          환율보기
        </button>
        {coinPrice && (
          <div className="flex flex-col mt-4 text-main font-bold text-xl">
            <div>1 Matic : {coinPrice} K₩</div>
            <div>1 K₩ : {1 / coinPrice} Matic</div>
          </div>
        )}
      </div>
    </div>
  );
}

export default a;
