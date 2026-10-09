// The gift box. Pure CSS and SVG, no 3D library: the lid is a rotateX
// transform under perspective, and the ribbon is an SVG stroke that draws in.
// state: "closed" | "open" | "sealed"

export default function GiftBox({ state = "open", note, size = "lg" }) {
  return (
    <div className={`box box--${size} is-${state}`} aria-hidden="true">
      <div className="box__stage">
        <div className="box__card">
          <img src="/images/logo.webp" alt="" width="64" height="64" />
          <p className="box__card-line">20% of every order</p>
          <p className="box__card-sub">goes to Freedom Acres Ranch</p>
        </div>

        <div className="box__base">
          <span className="box__band" />
        </div>

        <div className="box__lid">
          <span className="box__lid-top" />
          <span className="box__lid-front">
            <span className="box__band box__band--lid" />
          </span>
        </div>

        <svg className="box__bow" viewBox="0 0 160 70" fill="none">
          <path d="M80 40 C 50 0, 10 10, 30 40 C 45 60, 70 48, 80 40 Z" />
          <path d="M80 40 C 110 0, 150 10, 130 40 C 115 60, 90 48, 80 40 Z" />
          <path d="M78 42 L 60 68 M82 42 L 100 68" />
        </svg>
      </div>

      {note ? <p className="box__note">“{note}”</p> : null}
    </div>
  );
}
