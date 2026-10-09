import { useEffect, useMemo, useRef, useState } from "react";
import GiftBox from "./components/GiftBox.jsx";
import { MENU, DONATION_RATE, CHARITY, CHARITY_PLACE, LEAD_TIME_LABEL, money } from "./data/menu.js";

const reducedMotion = () =>
  typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

const YEAR = new Date().getFullYear();

const todayPlus = (days) => {
  const d = new Date();
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
};

const formatPhone = (v) => {
  const d = v.replace(/\D/g, "").slice(0, 10);
  if (d.length < 4) return d;
  if (d.length < 7) return `(${d.slice(0, 3)}) ${d.slice(3)}`;
  return `(${d.slice(0, 3)}) ${d.slice(3, 6)}-${d.slice(6)}`;
};

const EMPTY = {
  fulfillment: "",
  address: "",
  date: "",
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  note: "",
  teacherName: "",
  school: "",
  teacherNote: "",
};

export default function App() {
  const [boxState, setBoxState] = useState(() => (reducedMotion() ? "open" : "closed"));
  const [qty, setQty] = useState({});
  const [form, setForm] = useState(EMPTY);
  const [errors, setErrors] = useState({});
  const [placed, setPlaced] = useState(null);
  const confirmRef = useRef(null);
  const orderRef = useRef(null);

  // Act 1: the lid lifts shortly after load. Nothing waits on it.
  useEffect(() => {
    if (boxState !== "closed") return;
    const t = setTimeout(() => setBoxState("open"), 600);
    return () => clearTimeout(t);
  }, [boxState]);

  const lines = useMemo(
    () => MENU.filter((m) => qty[m.id] > 0).map((m) => ({ ...m, qty: qty[m.id], total: m.price * qty[m.id] })),
    [qty]
  );
  const count = lines.reduce((s, l) => s + l.qty, 0);
  const subtotal = lines.reduce((s, l) => s + l.total, 0);
  const donation = Math.round(subtotal * DONATION_RATE * 100) / 100;
  const hasTeacher = (qty["teacher-box"] || 0) > 0;

  const setQ = (id, n) => setQty((q) => ({ ...q, [id]: Math.max(0, Math.min(10, n)) }));
  const set = (k) => (e) => setForm((f) => ({ ...f, [k]: k === "phone" ? formatPhone(e.target.value) : e.target.value }));

  function validate() {
    const e = {};
    if (!count) e.items = "Add at least one treat to your box.";
    if (!form.fulfillment) e.fulfillment = "Choose pickup or delivery.";
    if (form.fulfillment === "delivery" && !form.address.trim()) e.address = "Add the delivery address.";
    if (!form.date) e.date = "Choose the date you need your order.";
    if (!form.firstName.trim()) e.firstName = "Add your first name.";
    if (!form.lastName.trim()) e.lastName = "Add your last name.";
    if (form.phone.replace(/\D/g, "").length !== 10) e.phone = "Enter a 10-digit phone number.";
    if (!/^\S+@\S+\.\S+$/.test(form.email)) e.email = "Enter a valid email address.";
    if (hasTeacher && !form.teacherName.trim()) e.teacherName = "Add the teacher’s name.";
    if (hasTeacher && !form.school.trim()) e.school = "Add the school.";
    return e;
  }

  function submit(ev) {
    ev.preventDefault();
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) {
      const first = document.querySelector(`[data-field="${Object.keys(e)[0]}"]`);
      first?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "center" });
      first?.querySelector("input, textarea, button")?.focus({ preventScroll: true });
      return;
    }
    // Square: create a payment link for this order here and redirect.
    setPlaced({ lines, subtotal, donation, form });
    requestAnimationFrame(() => {
      confirmRef.current?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth", block: "start" });
      confirmRef.current?.focus({ preventScroll: true });
    });
  }

  function reset() {
    setPlaced(null);
    setQty({});
    setForm(EMPTY);
    setErrors({});
    window.scrollTo({ top: 0 });
  }

  const goToOrder = () => orderRef.current?.scrollIntoView({ behavior: reducedMotion() ? "auto" : "smooth" });

  return (
    <>
      <p className="preview-bar">Preview site · orders are not processed yet</p>

      <header className="site-header">
        <a className="site-header__brand" href="#top" aria-label="6IX Chocolate Co., home">
          <img src="/images/logo.webp" alt="" width="44" height="44" />
          <span>6IX Chocolate Co.</span>
        </a>
        <nav className="site-header__nav" aria-label="Main">
          <a href="#menu">Menu</a>
          <a href="#events">Events</a>
          <a className="btn btn--small" href="#menu">Order</a>
        </nav>
      </header>

      <main id="top">
        {/* Act 1: the invitation */}
        <section className="hero">
          <div className="hero__copy">
            <p className="eyebrow">Lewisville, TX · Pickup &amp; DFW delivery</p>
            <h1>
              Treats worth <em>giving.</em>
            </h1>
            <p className="hero__lede">
              Hand-dipped strawberries, cheesecake cones and cake pops, boxed like a gift. And{" "}
              <strong>20% of every order goes to {CHARITY}</strong> in {CHARITY_PLACE}.
            </p>
            <div className="hero__actions">
              <a className="btn" href="#menu">Build your box</a>
              <a className="link" href="#events">Planning an event?</a>
            </div>
          </div>
          <div className="hero__box">
            <GiftBox state={boxState} />
          </div>
        </section>

        {placed ? (
          <Confirmation ref={confirmRef} placed={placed} onReset={reset} />
        ) : (
          <div className="shop" id="menu">
            <div className="shop__main">
              {/* Act 2: the curation */}
              <section aria-labelledby="menu-title">
                <div className="section-head">
                  <p className="eyebrow">The menu</p>
                  <h2 id="menu-title">Fill your box</h2>
                </div>
                {errors.items ? <p className="error error--block" data-field="items">{errors.items}</p> : null}
                <ul className="menu">
                  {MENU.map((item) => (
                    <MenuCard key={item.id} item={item} n={qty[item.id] || 0} onChange={(n) => setQ(item.id, n)} />
                  ))}
                </ul>
              </section>

              {/* Act 3: the gift sealed */}
              <form className="order" ref={orderRef} onSubmit={submit} noValidate aria-labelledby="order-title">
                <div className="section-head">
                  <p className="eyebrow">Your order</p>
                  <h2 id="order-title">How it gets to you</h2>
                </div>

                <fieldset className="field" data-field="fulfillment">
                  <legend>Pickup or delivery</legend>
                  <div className="choice-row">
                    <label className={`choice${form.fulfillment === "pickup" ? " is-on" : ""}`}>
                      <input type="radio" name="fulfillment" value="pickup" checked={form.fulfillment === "pickup"} onChange={set("fulfillment")} />
                      <span>
                        <strong>Porch pickup</strong>
                        <small>Lewisville, TX. Address sent after you order.</small>
                      </span>
                    </label>
                    <label className={`choice${form.fulfillment === "delivery" ? " is-on" : ""}`}>
                      <input type="radio" name="fulfillment" value="delivery" checked={form.fulfillment === "delivery"} onChange={set("fulfillment")} />
                      <span>
                        <strong>DFW hand-delivery</strong>
                        <small>Fee based on distance, confirmed before your order is final.</small>
                      </span>
                    </label>
                  </div>
                  <Err msg={errors.fulfillment} />
                </fieldset>

                {form.fulfillment === "delivery" ? (
                  <Field id="address" label="Delivery address" error={errors.address}>
                    <input id="address" autoComplete="street-address" value={form.address} onChange={set("address")} />
                  </Field>
                ) : null}

                <Field id="date" label="Date you need it" hint={`Orders need at least ${LEAD_TIME_LABEL}’ notice.`} error={errors.date}>
                  <input id="date" type="date" min={todayPlus(1)} value={form.date} onChange={set("date")} />
                </Field>

                {hasTeacher ? (
                  <div className="teacher">
                    <p className="teacher__title">Your Teacher Treat Box</p>
                    <div className="grid-2">
                      <Field id="teacherName" label="Teacher’s name" error={errors.teacherName}>
                        <input id="teacherName" value={form.teacherName} onChange={set("teacherName")} />
                      </Field>
                      <Field id="school" label="School" error={errors.school}>
                        <input id="school" value={form.school} onChange={set("school")} />
                      </Field>
                    </div>
                    <Field id="teacherNote" label="Note for the teacher (optional)" hint="Sponsoring more than one? List each teacher here.">
                      <textarea id="teacherNote" rows="2" value={form.teacherNote} onChange={set("teacherNote")} />
                    </Field>
                  </div>
                ) : null}

                <div className="grid-2">
                  <Field id="firstName" label="First name" error={errors.firstName}>
                    <input id="firstName" autoComplete="given-name" value={form.firstName} onChange={set("firstName")} />
                  </Field>
                  <Field id="lastName" label="Last name" error={errors.lastName}>
                    <input id="lastName" autoComplete="family-name" value={form.lastName} onChange={set("lastName")} />
                  </Field>
                  <Field id="phone" label="Phone" error={errors.phone}>
                    <input id="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="(000) 000-0000" value={form.phone} onChange={set("phone")} />
                  </Field>
                  <Field id="email" label="Email" error={errors.email}>
                    <input id="email" type="email" autoComplete="email" value={form.email} onChange={set("email")} />
                  </Field>
                </div>

                <Field id="note" label="Gift note (optional)" hint="We’ll tuck this into the box.">
                  <textarea id="note" rows="2" maxLength={160} value={form.note} onChange={set("note")} />
                </Field>

                <div className="order__submit">
                  <button className="btn btn--wide" type="submit">
                    Continue to payment{subtotal ? ` · ${money(subtotal)}` : ""}
                  </button>
                  <p className="fine">Secure checkout with Square. Delivery fees are confirmed before payment.</p>
                </div>
              </form>
            </div>

            <aside className="shop__side">
              <GiftTag lines={lines} subtotal={subtotal} donation={donation} />
            </aside>

            <MobileBar count={count} subtotal={subtotal} donation={donation} onReview={goToOrder} />
          </div>
        )}

        <Events />
      </main>

      <footer className="site-footer">
        <img src="/images/logo.webp" alt="6IX Chocolate Co. logo" width="72" height="72" />
        <p>
          20% of every order goes to <strong>{CHARITY}</strong>, {CHARITY_PLACE}.
        </p>
        <p className="fine">Lewisville, TX · Porch pickup and DFW hand-delivery · © {YEAR} 6IX Chocolate Co.</p>
      </footer>
    </>
  );
}

function MenuCard({ item, n, onChange }) {
  const id = `qty-${item.id}`;
  return (
    <li className={`menu-card${n ? " is-in" : ""}`}>
      <div className="menu-card__media">
        {item.image ? (
          <img src={item.image} alt={item.alt} loading="lazy" width="900" height="1125" />
        ) : (
          <div className="menu-card__placeholder" aria-hidden="true">
            <span>{item.short}</span>
            <small>Photo coming</small>
          </div>
        )}
      </div>
      <div className="menu-card__body">
        <h3>{item.name}</h3>
        <p>{item.blurb}</p>
        <div className="menu-card__row">
          <span className="price">{money(item.price)}</span>
          <div className="stepper" role="group" aria-label={`Quantity of ${item.name}`}>
            <button type="button" onClick={() => onChange(n - 1)} disabled={!n} aria-label={`Remove one ${item.short}`}>−</button>
            <output id={id} aria-live="polite">{n}</output>
            <button type="button" onClick={() => onChange(n + 1)} disabled={n >= 10} aria-label={`Add one ${item.short}`}>+</button>
          </div>
        </div>
      </div>
    </li>
  );
}

function GiftTag({ lines, subtotal, donation }) {
  return (
    <div className="tag" aria-live="polite" aria-label="Your box">
      <span className="tag__hole" aria-hidden="true" />
      <p className="tag__title">Your box</p>
      {lines.length ? (
        <ul className="tag__lines">
          {lines.map((l) => (
            <li key={l.id}>
              <span>{l.qty} × {l.short}</span>
              <span>{money(l.total)}</span>
            </li>
          ))}
        </ul>
      ) : (
        <p className="tag__empty">Nothing in your box yet. Add a treat to start.</p>
      )}
      <div className="tag__total">
        <span>Subtotal</span>
        <strong>{money(subtotal)}</strong>
      </div>
      <p className="tag__give">
        Your order gives <strong>{money(donation)}</strong> to {CHARITY}
      </p>
      <a className="btn btn--wide" href="#order-title">Review order</a>
    </div>
  );
}

function MobileBar({ count, subtotal, donation, onReview }) {
  if (!count) return null;
  return (
    <div className="mobile-bar" role="region" aria-label="Your box">
      <div>
        <strong>{count} {count === 1 ? "treat" : "treats"} · {money(subtotal)}</strong>
        <small>Gives {money(donation)} to {CHARITY}</small>
      </div>
      <button className="btn btn--small" type="button" onClick={onReview}>Review order</button>
    </div>
  );
}

function Confirmation({ ref, placed, onReset }) {
  const [state, setState] = useState(() => (reducedMotion() ? "sealed" : "open"));
  useEffect(() => {
    if (state !== "open") return;
    const t = setTimeout(() => setState("sealed"), 400);
    return () => clearTimeout(t);
  }, [state]);
  const { lines, subtotal, donation, form } = placed;
  return (
    <section className="confirm" ref={ref} tabIndex={-1} aria-labelledby="confirm-title">
      <GiftBox state={state} note={form.note} size="md" />
      <div className="confirm__body">
        <p className="eyebrow">Your box is sealed</p>
        <h2 id="confirm-title">Thank you, {form.firstName}.</h2>
        <p>
          {form.fulfillment === "pickup"
            ? "We’ll text you the pickup address and time."
            : "We’ll confirm your delivery fee and time by text."}{" "}
          Your order is for <strong>{new Date(form.date + "T12:00").toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" })}</strong>.
        </p>
        <ul className="tag__lines">
          {lines.map((l) => (
            <li key={l.id}>
              <span>{l.qty} × {l.short}</span>
              <span>{money(l.total)}</span>
            </li>
          ))}
        </ul>
        <div className="tag__total">
          <span>Subtotal</span>
          <strong>{money(subtotal)}</strong>
        </div>
        <p className="tag__give">
          You just gave <strong>{money(donation)}</strong> to {CHARITY}.
        </p>
        <p className="fine">Preview: at launch, this step opens secure Square checkout before the box seals.</p>
        <button className="btn btn--ghost" type="button" onClick={onReset}>Start a new order</button>
      </div>
    </section>
  );
}

function Events() {
  const [sent, setSent] = useState(false);
  return (
    <section className="events" id="events" aria-labelledby="events-title">
      <div className="section-head">
        <p className="eyebrow">Private events</p>
        <h2 id="events-title">Planning an event?</h2>
        <p>Tell us the date, the guest count and the treats you’re thinking of. You’ll get a catering quote within 24 hours.</p>
      </div>
      {sent ? (
        <p className="events__thanks">Thank you. We’ll send your quote within 24 hours. (Preview: inquiries aren’t sent yet.)</p>
      ) : (
        <form
          className="events__form"
          onSubmit={(e) => {
            e.preventDefault();
            if (e.currentTarget.checkValidity()) setSent(true);
            else e.currentTarget.reportValidity();
          }}
        >
          <div className="grid-2">
            <Field id="ev-date" label="Event date">
              <input id="ev-date" type="date" required min={todayPlus(1)} />
            </Field>
            <Field id="ev-guests" label="Guest count (about)">
              <input id="ev-guests" type="number" min="1" inputMode="numeric" required />
            </Field>
            <Field id="ev-name" label="Name">
              <input id="ev-name" autoComplete="name" required />
            </Field>
            <Field id="ev-contact" label="Phone or email">
              <input id="ev-contact" required />
            </Field>
          </div>
          <Field id="ev-treats" label="Treats you’re interested in">
            <textarea id="ev-treats" rows="3" />
          </Field>
          <button className="btn" type="submit">Request a quote</button>
        </form>
      )}
    </section>
  );
}

function Field({ id, label, hint, error, children }) {
  return (
    <div className={`field${error ? " has-error" : ""}`} data-field={id}>
      <label htmlFor={id}>{label}</label>
      {hint ? <p className="hint">{hint}</p> : null}
      {children}
      <Err msg={error} />
    </div>
  );
}

function Err({ msg }) {
  return msg ? <p className="error" role="alert">{msg}</p> : null;
}
