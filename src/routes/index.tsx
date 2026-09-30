import { useRef, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowDown, Check, ChevronDown, Leaf, Plus, ShieldCheck } from "lucide-react";
import { Button } from "@/components/ui/button";

const goals = [
  { kilos: 5, price: 399, label: "Starter pack" },
  { kilos: 10, price: 799, label: "2-bottle pack" },
  { kilos: 15, price: 1299, label: "3-bottle pack" },
  { kilos: 20, price: 1799, label: "4-bottle pack" },
  { kilos: 25, price: 2299, label: "5-bottle pack" },
] as const;

const indianMobile = z
  .string()
  .trim()
  .regex(/^(?:\+91[\s-]?)?[6-9](?:[\d\s-]{8,12})$/, "Enter a valid 10-digit Indian mobile number.")
  .refine((value) => {
    const digits = value.replace(/\D/g, "");
    return digits.length === 10 || (value.startsWith("+91") && digits.length === 12);
  }, "Enter a valid 10-digit Indian mobile number.");

const orderSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "Name must be 80 characters or fewer."),
  phone: indianMobile,
  address: z.string().trim().min(8, "Please enter your complete delivery address.").max(240, "Address must be 240 characters or fewer."),
  pincode: z.string().trim().regex(/^\d{6}$/, "Enter a valid 6-digit pincode."),
});

const subscriptionSchema = z.object({
  name: z.string().trim().min(2, "Please enter your name.").max(80, "Name must be 80 characters or fewer."),
  phone: indianMobile,
  goal: z.string().regex(/^(5|10|15|20|25)$/, "Please choose a goal."),
});

const questions = [
  {
    question: "Does Slimofast work without exercise?",
    answer: "The product information describes the formula as suitable alongside your normal routine. Everyone's experience differs; speak to a healthcare professional before using a supplement.",
  },
  {
    question: "Is Cash on Delivery available?",
    answer: "Cash on Delivery is available for eligible delivery pin codes. Add your six-digit pincode above to place your order.",
  },
  {
    question: "How quickly will I see results?",
    answer: "Results vary from person to person. The product guide recommends consistent daily use and allowing time for individual results.",
  },
  {
    question: "Are there any side effects?",
    answer: "Individual responses may vary. Please read the product label and consult your doctor before using this supplement, especially if you take medication or have a health condition.",
  },
  {
    question: "What if it doesn't work for me?",
    answer: "For support with a Slimofast order or product, contact the seller using the contact details supplied with your order.",
  },
];

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Slimofast | Herbal Weight Management" },
      { name: "description", content: "Explore Slimofast, compare product packs, and place your order with Cash on Delivery or online payment." },
      { property: "og:title", content: "Slimofast | Herbal Weight Management" },
      { property: "og:description", content: "Explore Slimofast, compare product packs, and place your order with Cash on Delivery or online payment." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: SlimofastPage,
});

function SlimofastPage() {
  const [selectedGoal, setSelectedGoal] = useState(10);
  const [payment, setPayment] = useState<"cod" | "online">("cod");
  const [openQuestion, setOpenQuestion] = useState<number | null>(0);
  const [orderErrors, setOrderErrors] = useState<Record<string, string>>({});
  const [subscriptionErrors, setSubscriptionErrors] = useState<Record<string, string>>({});
  const [orderNotice, setOrderNotice] = useState("");
  const [subscriptionNotice, setSubscriptionNotice] = useState("");
  const orderForm = useRef<HTMLFormElement>(null);
  const picked = goals.find((goal) => goal.kilos === selectedGoal) ?? goals[1];
  const price = picked.price - (payment === "online" ? 100 : 0);
  const bottles = Math.ceil(picked.kilos / 5);

  function scrollToOrder() {
    orderForm.current?.scrollIntoView({ behavior: "smooth", block: "center" });
    window.setTimeout(() => orderForm.current?.querySelector<HTMLInputElement>("input[name=name]")?.focus(), 450);
  }

  function handleOrderSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const values = Object.fromEntries(new FormData(form).entries());
    const parsed = orderSchema.safeParse(values);
    if (!parsed.success) {
      setOrderErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      setOrderNotice("Please check the highlighted details.");
      return;
    }
    setOrderErrors({});
    sessionStorage.setItem("slimofast-order-confirmation", JSON.stringify({
      name: parsed.data.name,
      phone: parsed.data.phone,
      address: parsed.data.address,
      pincode: parsed.data.pincode,
      goal: selectedGoal,
      price,
      payment,
    }));
    window.location.assign("/thank-you");
  }

  function handleSubscriptionSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const values = Object.fromEntries(new FormData(event.currentTarget).entries());
    const parsed = subscriptionSchema.safeParse(values);
    if (!parsed.success) {
      setSubscriptionErrors(Object.fromEntries(parsed.error.issues.map((issue) => [String(issue.path[0]), issue.message])));
      setSubscriptionNotice("Please check the highlighted details.");
      return;
    }
    setSubscriptionErrors({});
    const WHATSAPP_DESTINATION_NUMBER = "91XXXXXXXXXX";
    const message = `Hello Slimofast, my name is ${parsed.data.name}. I am interested in the ${parsed.data.goal} kg goal. You can reach me at ${parsed.data.phone}.`;
    window.location.assign(`https://wa.me/${WHATSAPP_DESTINATION_NUMBER}?text=${encodeURIComponent(message)}`);
  }

  return (
    <main className="slimofast-page">
      <div className="offer-ribbon">Buy 1 Get 1 FREE <span aria-hidden="true">·</span> Cash on Delivery available</div>
      <header className="site-header">
        <a className="brand-mark" href="#top" aria-label="Slimofast home"><Leaf aria-hidden="true" />slimofast<span>.</span></a>
        <a className="header-order" href="#order">Shop offers <ArrowDown aria-hidden="true" /></a>
      </header>

      <section className="intro-section" id="top">
        <div className="intro-copy">
          <p className="eyebrow"><span className="eyebrow-dot" /> HERBAL DAILY ROUTINE</p>
          <h1>Feel lighter.<br /><span>Your way.</span></h1>
          <p className="intro-description">Meet Slimofast: an everyday herbal formula, designed to fit your routine—no gym plan required.</p>
          <div className="review-line"><span className="review-stars" aria-label="Rated 4.8 out of 5">★★★★★</span><strong>4.8 / 5</strong><span>·</span><span>8,327 verified reviews</span></div>
          <Button type="button" className="primary-action" onClick={scrollToOrder}>Explore the offers <ArrowDown aria-hidden="true" /></Button>
        </div>
        <div className="intro-photo-wrap">
          <img className="intro-photo" src="/images/capsule-routine.webp" alt="Woman taking a daily capsule with a glass of water" />
          <div className="photo-note"><span aria-hidden="true">✳</span><span>One small step<br />for your daily routine</span></div>
          <span className="photo-index">SLIMOFAST · EVERYDAY WELLNESS</span>
        </div>
      </section>

      <section className="offer-section section-wrap" aria-labelledby="offer-title" id="offers">
        <div className="section-heading offer-heading">
          <p className="eyebrow">A LITTLE MORE IN EVERY BOX</p>
          <h2 id="offer-title">A better daily routine<br className="desktop-break" /> starts here.</h2>
          <p>Get your second bottle free. The offer is already included.</p>
        </div>
        <div className="offer-grid">
          <div className="offer-story">
            <div className="gift-illustration" aria-hidden="true">✳</div>
            <div><strong>Buy 1, Get 1 FREE</strong><p>Two bottles. Pay for one.<br />Free delivery on your order.</p></div>
            <span className="offer-note">TODAY'S OFFER</span>
          </div>
          <div className="price-panel">
            <div className="price-panel-top"><span>YOUR SELECTED PACK</span><span className="live-offer"><Check aria-hidden="true" /> OFFER APPLIED</span></div>
            <div className="price-main"><div><span className="price-caption">{picked.label} · {selectedGoal} kg goal</span><strong>₹{price.toLocaleString("en-IN")}</strong></div><div className="price-delivery">{payment === "cod" ? "Cash on Delivery" : "Online · ₹100 off"}<br /><span>Free delivery</span></div></div>
            <p className="price-footnote">{bottles} {bottles === 1 ? "bottle" : "bottles"} · {bottles * 30} daily servings</p>
          </div>
        </div>
        <Button type="button" className="primary-action offer-order" onClick={scrollToOrder}>Place your order <ArrowDown aria-hidden="true" /></Button>
      </section>

      <section className="struggle-section full-band" aria-labelledby="struggle-title">
        <div className="section-wrap">
          <div className="section-heading"><p className="eyebrow">YOU'RE NOT ALONE</p><h2 id="struggle-title">Sound familiar?</h2><p>Finding a routine that sticks can be hard.</p></div>
          <div className="struggle-list">
            {[
              ["01", "Tried diets, but the weight keeps coming back"],
              ["02", "No time—or energy—for the gym"],
              ["03", "Stubborn areas that are hard to shift"],
              ["04", "Afternoon slumps and low motivation"],
              ["05", "Tired of spending on things that don't fit your routine"],
            ].map(([number, text]) => <div className="struggle-row" key={number}><span className="struggle-number">{number}</span><span>{text}</span><Plus aria-hidden="true" /></div>)}
          </div>
        </div>
      </section>

      <section className="benefits-section section-wrap" aria-labelledby="benefits-title">
        <div className="section-heading"><p className="eyebrow">GOOD INGREDIENTS, EVERY DAY</p><h2 id="benefits-title">A simpler kind<br className="desktop-break" /> of wellness.</h2><p>Four ways Slimofast fits into the way you live.</p></div>
        <div className="benefits-grid">
          {[
            ["01", "Metabolism support", "Garcinia Cambogia and green tea extract, in one easy daily capsule."],
            ["02", "Mindful appetite support", "A thoughtful addition to the healthy habits you're already building."],
            ["03", "Energy, without the jitters", "A no-caffeine-crash approach to keeping your everyday routine moving."],
            ["04", "Feel-good digestion", "Simple daily support to help you feel a little more comfortable in your routine."],
          ].map(([number, title, body]) => <article className="benefit-item" key={number}><span className="benefit-number">{number}</span><span className="benefit-icon"><Leaf aria-hidden="true" /></span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="stories-section full-band" aria-labelledby="stories-title">
        <div className="section-wrap">
          <div className="section-heading stories-heading"><p className="eyebrow">KIND WORDS FROM CUSTOMERS</p><h2 id="stories-title">Real people.<br />Real routines.</h2><p>Customer stories shared in the supplied product design.</p></div>
          <div className="stories-grid">
            <article className="story-card"><div className="story-photo"><img src="/images/customer-story-women.webp" alt="Before-and-after customer progress photo of two women" loading="lazy" /><span className="story-result">−7 kg</span></div><div className="story-review"><span className="review-stars" aria-label="5 out of 5 stars">★★★★★</span><p>“I was frustrated. By week three my jeans felt looser. My family asked what I was doing differently.”</p><strong>Priya S.</strong><span>Mumbai · Verified purchase</span></div></article>
            <article className="story-card"><div className="story-photo"><img src="/images/customer-story-men.webp" alt="Before-and-after customer progress photo" loading="lazy" /><span className="story-result">−8 kg</span></div><div className="story-review"><span className="review-stars" aria-label="5 out of 5 stars">★★★★★</span><p>“A desk job meant zero gym time. COD made it easy to give a new daily routine a try.”</p><strong>Karthik M.</strong><span>Chennai · Verified purchase</span></div></article>
          </div>
          <p className="stories-note">Individual experiences and results vary.</p>
        </div>
      </section>

      <section className="goals-section section-wrap" aria-labelledby="goals-title">
        <div className="section-heading"><p className="eyebrow">CHOOSE YOUR PACK</p><h2 id="goals-title">Your goal.<br />Your pace.</h2><p>Choose your goal to see the available pack and price.</p></div>
        <div className="goal-picker" role="group" aria-label="Select your weight goal">
          {goals.map((goal) => <Button key={goal.kilos} type="button" variant={selectedGoal === goal.kilos ? "default" : "outline"} className={`goal-button${selectedGoal === goal.kilos ? " is-selected" : ""}`} aria-pressed={selectedGoal === goal.kilos} onClick={() => setSelectedGoal(goal.kilos)}><span>{goal.kilos} kg</span><strong>₹{goal.price.toLocaleString("en-IN")}</strong></Button>)}
        </div>
        <div className="selection-summary" aria-live="polite"><div className="summary-check"><Check aria-hidden="true" /></div><div><span className="summary-kicker">YOUR SELECTED GOAL · {selectedGoal} KG</span><h3>{picked.label} <span>·</span> {bottles * 30} servings</h3><p>Includes {bottles} {bottles === 1 ? "bottle" : "bottles"}. Order online to save ₹100.</p></div></div>
      </section>

      <section className="routine-section full-band" aria-labelledby="routine-title">
        <div className="section-wrap routine-layout">
          <div className="section-heading"><p className="eyebrow">THREE STEPS · ONE DAILY HABIT</p><h2 id="routine-title">Easy to make<br />your own.</h2><p>A simple rhythm to bring along as you build a routine.</p><img className="routine-photo" src="/images/capsule-routine.webp" alt="A daily capsule and a glass of water" loading="lazy" /></div>
          <ol className="routine-list"><li><span>01</span><div><h3>Two capsules a day</h3><p>Take one 30 minutes before breakfast, and one 30 minutes after dinner.</p></div></li><li><span>02</span><div><h3>Eat your normal meals</h3><p>Enjoy a balanced routine without crash dieting. Consider reducing fatty and sugary foods.</p></div></li><li><span>03</span><div><h3>Keep it consistent</h3><p>The supplied product guide recommends daily use and allowing 40–60 days for results.</p></div></li></ol>
        </div>
      </section>

      <section className="faq-section section-wrap" aria-labelledby="faq-title">
        <div className="section-heading"><p className="eyebrow">A FEW USEFUL THINGS TO KNOW</p><h2 id="faq-title">Good to know.</h2><p>Questions about starting your routine?</p></div>
        <div className="faq-list">{questions.map(({ question, answer }, index) => { const isOpen = openQuestion === index; const answerId = `faq-answer-${index}`; return <article className={`faq-item${isOpen ? " is-open" : ""}`} key={question}><button className="faq-question" type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenQuestion(isOpen ? null : index)}><span>{question}</span><ChevronDown aria-hidden="true" /></button>{isOpen && <div className="faq-answer" id={answerId}><p>{answer}</p></div>}</article>; })}</div>
      </section>

      <section className="order-section full-band" id="order" aria-labelledby="order-title">
        <div className="section-wrap order-layout">
          <div className="order-copy"><p className="eyebrow">READY WHEN YOU ARE</p><h2 id="order-title">Start right<br />where you are.</h2><p>Fill in your delivery details. Your selected pack is ready to go.</p><div className="order-assurance"><ShieldCheck aria-hidden="true" /><span>Free delivery <span>·</span> Cash on Delivery available</span></div><div className="order-assurance"><Check aria-hidden="true" /><span>Buy 1 Get 1 FREE already included</span></div></div>
          <form ref={orderForm} className="order-form" onSubmit={handleOrderSubmit} noValidate aria-label="Delivery order form">
            <div className="form-heading"><div><span>YOUR ORDER</span><h3>{selectedGoal} kg goal <span>·</span> {picked.label}</h3></div><strong>₹{price.toLocaleString("en-IN")}</strong></div>
            <div className="form-field"><label htmlFor="order-name">Name</label><input id="order-name" name="name" placeholder="Your full name" autoComplete="name" maxLength={80} aria-invalid={Boolean(orderErrors["name"])} aria-describedby={orderErrors["name"] ? "order-name-error" : undefined} />{orderErrors["name"] && <span className="field-error" id="order-name-error">{orderErrors["name"]}</span>}</div>
            <div className="form-field"><label htmlFor="order-phone">Mobile number</label><div className="phone-input"><span aria-hidden="true">+91</span><input id="order-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="10-digit mobile number" maxLength={18} aria-invalid={Boolean(orderErrors["phone"])} aria-describedby={orderErrors["phone"] ? "order-phone-error" : undefined} /></div>{orderErrors["phone"] && <span className="field-error" id="order-phone-error">{orderErrors["phone"]}</span>}</div>
            <div className="form-field"><label htmlFor="order-address">Delivery address</label><input id="order-address" name="address" placeholder="House no., street, area" autoComplete="street-address" maxLength={240} aria-invalid={Boolean(orderErrors["address"])} aria-describedby={orderErrors["address"] ? "order-address-error" : undefined} />{orderErrors["address"] && <span className="field-error" id="order-address-error">{orderErrors["address"]}</span>}</div>
            <div className="form-field"><label htmlFor="order-pincode">Pincode</label><input id="order-pincode" name="pincode" type="text" inputMode="numeric" autoComplete="postal-code" placeholder="6-digit pincode" maxLength={6} aria-invalid={Boolean(orderErrors["pincode"])} aria-describedby={orderErrors["pincode"] ? "order-pincode-error" : undefined} />{orderErrors["pincode"] && <span className="field-error" id="order-pincode-error">{orderErrors["pincode"]}</span>}</div>
            <fieldset className="payment-fieldset"><legend>Payment type</legend><div className="payment-choices"><Button type="button" variant={payment === "cod" ? "default" : "outline"} className={`payment-choice${payment === "cod" ? " is-selected" : ""}`} aria-pressed={payment === "cod"} onClick={() => setPayment("cod")}>Cash on Delivery</Button><Button type="button" variant={payment === "online" ? "default" : "outline"} className={`payment-choice${payment === "online" ? " is-selected" : ""}`} aria-pressed={payment === "online"} onClick={() => setPayment("online")}>Online · ₹100 off</Button></div></fieldset>
            <div className="field-total"><span>Total · free delivery</span><strong>₹{price.toLocaleString("en-IN")}</strong></div>
            {orderNotice && <p className={`form-notice${Object.keys(orderErrors).length ? " form-notice-error" : ""}`} role="status">{orderNotice}</p>}
            <Button type="submit" className="primary-action submit-order">Place order <span>·</span> Free delivery <Check aria-hidden="true" /></Button>
            <p className="privacy-note">Your details are used only to prepare this order.</p>
          </form>
        </div>
      </section>

      <section className="subscribe-section section-wrap" aria-labelledby="subscribe-title">
        <div className="subscribe-heading"><p className="eyebrow">A LITTLE HELP GETTING STARTED</p><h2 id="subscribe-title">Let's make a plan.</h2><p>Share your goal and we’ll get your Slimofast conversation started on WhatsApp.</p></div>
        <form className="subscribe-form" onSubmit={handleSubscriptionSubmit} noValidate aria-label="WhatsApp wellness plan form">
          <div className="form-field"><label htmlFor="subscribe-name">Name</label><input id="subscribe-name" name="name" placeholder="Your name" autoComplete="name" maxLength={80} aria-invalid={Boolean(subscriptionErrors["name"])} aria-describedby={subscriptionErrors["name"] ? "subscribe-name-error" : undefined} />{subscriptionErrors["name"] && <span className="field-error" id="subscribe-name-error">{subscriptionErrors["name"]}</span>}</div>
          <div className="form-field"><label htmlFor="subscribe-phone">Mobile number</label><div className="phone-input"><span aria-hidden="true">+91</span><input id="subscribe-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="10-digit mobile number" maxLength={18} aria-invalid={Boolean(subscriptionErrors["phone"])} aria-describedby={subscriptionErrors["phone"] ? "subscribe-phone-error" : undefined} /></div>{subscriptionErrors["phone"] && <span className="field-error" id="subscribe-phone-error">{subscriptionErrors["phone"]}</span>}</div>
          <div className="form-field"><label htmlFor="subscribe-goal">Your goal</label><select id="subscribe-goal" name="goal" defaultValue="10" aria-invalid={Boolean(subscriptionErrors["goal"])} aria-describedby={subscriptionErrors["goal"] ? "subscribe-goal-error" : undefined}>{goals.map((goal) => <option key={goal.kilos} value={goal.kilos}>{goal.kilos} kg goal</option>)}</select>{subscriptionErrors["goal"] && <span className="field-error" id="subscribe-goal-error">{subscriptionErrors["goal"]}</span>}</div>
          {subscriptionNotice && <p className={`form-notice${Object.keys(subscriptionErrors).length ? " form-notice-error" : ""}`} role="status">{subscriptionNotice}</p>}
          <Button type="submit" className="primary-action submit-order">Continue on WhatsApp <ArrowDown aria-hidden="true" /></Button>
          <p className="privacy-note">WhatsApp destination: <code>91XXXXXXXXXX</code> — replace once your business number is confirmed.</p>
        </form>
      </section>

      <footer className="site-footer"><a className="brand-mark" href="#top"><Leaf aria-hidden="true" />slimofast<span>.</span></a><p>Read the product label. Dietary supplements are not a substitute for a balanced diet. Individual results vary.</p><span>© 2026 Slimofast</span></footer>

      <div className="sticky-order-bar"><div className="sticky-price"><span>YOUR SELECTED PACK</span><strong>₹{price.toLocaleString("en-IN")}</strong></div><Button type="button" className="sticky-order-button" onClick={scrollToOrder}>Order now <ArrowDown aria-hidden="true" /></Button></div>
    </main>
  );
}
