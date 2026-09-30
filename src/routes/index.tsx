import { useRef, useState, type FormEvent } from "react";
import { createFileRoute } from "@tanstack/react-router";
import { z } from "zod";
import { ArrowDown, Check, ChevronDown, Facebook, Instagram, Leaf, Plus, ShieldCheck, Youtube } from "lucide-react";
import { Button } from "@/components/ui/button";

const goals = [
  { kilos: 5, price: 399, label: "Starter pack" },
  { kilos: 10, price: 999, label: "2-bottle pack" },
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
  phone: indianMobile,
});

const questions = [
  {
    question: "Does Slimofast really work without exercise?",
    answer: "Yes. While adding light activity improves results, Slimofast's formula works through metabolism and appetite control—not calorie burn from exercise. Individual results vary.",
  },
  {
    question: "Is Cash on Delivery available everywhere?",
    answer: "Cash on Delivery is available for eligible delivery pin codes. Add your six-digit pincode to place your order.",
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
  const [openFooterPanel, setOpenFooterPanel] = useState<"legal" | "links" | null>(null);
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
    const paymentLabel = payment === "cod" ? "Cash on Delivery" : "online payment";
    const message = `Hello Slimofast, I would like to unlock offers and subscribe for content. My mobile number is ${parsed.data.phone}. I am interested in the ${selectedGoal} kg goal with ${paymentLabel}.`;
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
          <p className="eyebrow"><span className="eyebrow-dot" /> INDIA'S HERBAL WEIGHT LOSS FORMULA</p>
          <h1>LOSE <span>7–10 KILOS IN 30 DAYS.</span><br />NO GYM. NO DIET.</h1>
          <p className="intro-description">The real reason your fat isn't melting—and how this herbal formula helps support your routine.</p>
          <div className="review-line"><span className="review-stars" aria-label="Rated 4.8 out of 5">★★★★★</span><strong>4.8</strong><span>|</span><span>8,327 Verified Reviews</span></div>
        </div>
        <div className="intro-photo-wrap">
          <img className="intro-photo" src="/images/capsule-routine.webp" alt="Woman taking a daily capsule with a glass of water" />
            <div className="photo-note"><span aria-hidden="true">✳</span><span>Herbal formula<br />for your daily routine</span></div>
        </div>
      </section>

      <section className="offer-section section-wrap" aria-labelledby="offer-title" id="offers">
        <div className="section-heading offer-heading">
          <p className="eyebrow">TODAY ONLY</p>
          <h2 id="offer-title">Buy 1 Get 1 FREE</h2>
          <p>Automatically applied. 2 bottles. Buy 1 Get 1.</p>
        </div>
        <div className="offer-grid">
          <div className="offer-story">
            <div className="gift-illustration" aria-hidden="true">✳</div>
            <div><strong>Buy 1 Get 1 FREE</strong><p>Automatically applies.<br />Two bottles. Pay for one.</p></div>
            <span className="offer-note">TODAY'S OFFER</span>
          </div>
          <div className="price-panel">
            <div className="price-panel-top"><span>YOUR SELECTED PACK</span><span className="live-offer"><Check aria-hidden="true" /> OFFER APPLIED</span></div>
            <div className="price-main"><div><span className="price-caption">{picked.label} · {selectedGoal} kg goal</span><strong>₹{price.toLocaleString("en-IN")}</strong></div><div className="price-delivery">{payment === "cod" ? "Cash on Delivery" : "Online · ₹100 off"}<br /><span>Free delivery</span></div></div>
            <p className="price-footnote">{bottles} {bottles === 1 ? "bottle" : "bottles"} · {bottles * 30} daily servings</p>
          </div>
        </div>
        <Button type="button" className="primary-action offer-order" onClick={scrollToOrder}>PLACE ORDER - FREE DELIVERY ✓</Button>
      </section>

      <section className="struggle-section full-band" aria-labelledby="struggle-title">
        <div className="section-wrap">
          <div className="section-heading"><h2 id="struggle-title">STILL STRUGGLING WITH THIS?</h2><p>If any of these sound familiar—Slimofast was made for you.</p></div>
          <div className="struggle-list">
            {[
              ["😞", "Tried diets but the fat keeps coming back"],
              ["😴", "No time or energy for the gym"],
              ["😫", "Stubborn belly fat that refuses to move"],
              ["😓", "Always tired, zero motivation to exercise"],
              ["💸", "Spent money on supplements that did nothing"],
            ].map(([number, text]) => <div className="struggle-row" key={number}><span className="struggle-number">{number}</span><span>{text}</span><Plus aria-hidden="true" /></div>)}
          </div>
        </div>
      </section>

      <section className="benefits-section section-wrap" aria-labelledby="benefits-title">
        <div className="section-heading"><h2 id="benefits-title">WHY SLIMOFAST ACTUALLY WORKS</h2><p>3 mechanisms. 1 capsule. Real results in 14 days.</p></div>
        <div className="benefits-grid">
          {[
            ["01", "Activates Your Fat-Burning Mode", "Garcinia Cambogia + Green Tea. Supports your metabolism as part of your daily routine."],
            ["02", "Kills Hunger Cravings Naturally", "HCA in Garcinia Cambogia supports appetite control and mindful eating."],
            ["03", "All-Day Energy Without Caffeine Crash", "Natural energizers help keep you active and sharp throughout the day."],
            ["04", "Cleans Bloat & Improves Digestion", "Daily digestive support to help you feel lighter and more active."],
          ].map(([number, title, body]) => <article className="benefit-item" key={number}><span className="benefit-number">{number}</span><span className="benefit-icon"><Leaf aria-hidden="true" /></span><h3>{title}</h3><p>{body}</p></article>)}
        </div>
      </section>

      <section className="stories-section full-band" aria-labelledby="stories-title">
        <div className="section-wrap">
          <div className="section-heading stories-heading"><h2 id="stories-title">REAL RESULTS. REAL PEOPLE.</h2><p>Not paid models. Actual customers from across India.</p></div>
          <div className="stories-grid">
            <article className="story-card"><div className="story-photo"><img src="/images/customer-story-women.webp" alt="Before-and-after customer progress photo of two women" loading="lazy" /><span className="story-result">−7 kg</span></div><div className="story-review"><span className="review-stars" aria-label="5 out of 5 stars">★★★★★</span><p>“I was frustrated. By week three my jeans felt looser. My family asked what I was doing differently.”</p><strong>Priya S.</strong><span>Mumbai · Verified purchase</span></div></article>
            <article className="story-card"><div className="story-photo"><img src="/images/customer-story-men.webp" alt="Before-and-after customer progress photo" loading="lazy" /><span className="story-result">−8 kg</span></div><div className="story-review"><span className="review-stars" aria-label="5 out of 5 stars">★★★★★</span><p>“A desk job meant zero gym time. COD made it easy to give a new daily routine a try.”</p><strong>Karthik M.</strong><span>Chennai · Verified purchase</span></div></article>
          </div>
          <p className="stories-note">Individual experiences and results vary.</p>
        </div>
      </section>

      <section className="goals-section section-wrap" aria-labelledby="goals-title">
        <div className="section-heading"><h2 id="goals-title">How much weight do you want to lose?</h2><p>Select your goal—how many kilos for you:</p></div>
        <div className="goal-picker" role="group" aria-label="Select your weight goal">
          {goals.map((goal) => <Button key={goal.kilos} type="button" variant={selectedGoal === goal.kilos ? "default" : "outline"} className={`goal-button${selectedGoal === goal.kilos ? " is-selected" : ""}`} aria-pressed={selectedGoal === goal.kilos} onClick={() => setSelectedGoal(goal.kilos)}><span>{goal.kilos} kg</span><strong>₹{goal.price.toLocaleString("en-IN")}</strong></Button>)}
        </div>
        <div className="selection-summary" aria-live="polite"><div className="summary-check"><Check aria-hidden="true" /></div><div><span className="summary-kicker">YOUR SELECTED GOAL · {selectedGoal} KG</span><h3>{picked.label} <span>·</span> {bottles * 30} servings</h3><p>Includes {bottles} {bottles === 1 ? "bottle" : "bottles"}. Order online to save ₹100.</p></div></div>
      </section>

      <section className="routine-section full-band" aria-labelledby="routine-title">
        <div className="section-wrap routine-layout">
          <div className="section-heading"><h2 id="routine-title">How To Use</h2><p>Simple. Consistent. Effective.</p><img className="routine-photo" src="/images/capsule-routine.webp" alt="A daily capsule and a glass of water" loading="lazy" /></div>
          <ol className="routine-list"><li><span>01</span><div><h3>Take 2 Capsules Every Day</h3><p>Take 1 capsule 30 minutes before breakfast and 1 capsule 30 minutes after dinner.</p></div></li><li><span>02</span><div><h3>Eat Normal—No Crash Dieting</h3><p>Reduce fatty and sugary foods. Add Slimofast to a balanced daily routine.</p></div></li><li><span>03</span><div><h3>See Results in 14 Days</h3><p>Individual results vary. The product guide recommends allowing 40–60 days for optimal results.</p></div></li></ol>
        </div>
      </section>

      <section className="faq-section section-wrap" aria-labelledby="faq-title">
        <div className="section-heading"><h2 id="faq-title">QUESTIONS? WE'VE GOT ANSWERS.</h2></div>
        <div className="faq-list">{questions.map(({ question, answer }, index) => { const isOpen = openQuestion === index; const answerId = `faq-answer-${index}`; return <article className={`faq-item${isOpen ? " is-open" : ""}`} key={question}><button className="faq-question" type="button" aria-expanded={isOpen} aria-controls={answerId} onClick={() => setOpenQuestion(isOpen ? null : index)}><span>{question}</span><ChevronDown aria-hidden="true" /></button>{isOpen && <div className="faq-answer" id={answerId}><p>{answer}</p></div>}</article>; })}</div>
      </section>

      <section className="order-section full-band" id="order" aria-labelledby="order-title">
        <div className="section-wrap order-layout">
          <div className="order-copy"><p className="eyebrow">READY WHEN YOU ARE</p><h2 id="order-title">Start right<br />where you are.</h2><p>Fill in your delivery details. Your selected pack is ready to go.</p><div className="order-assurance"><ShieldCheck aria-hidden="true" /><span>Free delivery <span>·</span> Cash on Delivery available</span></div><div className="order-assurance"><Check aria-hidden="true" /><span>Buy 1 Get 1 FREE already included</span></div></div>
          <form ref={orderForm} className="order-form" onSubmit={handleOrderSubmit} noValidate aria-label="Delivery order form">
            <div className="form-heading"><div><span>YOUR ORDER</span><h3>{selectedGoal} kg goal <span>·</span> {picked.label}</h3></div><strong>₹{price.toLocaleString("en-IN")}</strong></div>
            <div className="form-field"><label htmlFor="order-name">Naam</label><input id="order-name" name="name" placeholder="Your full name" autoComplete="name" maxLength={80} aria-invalid={Boolean(orderErrors["name"])} aria-describedby={orderErrors["name"] ? "order-name-error" : undefined} />{orderErrors["name"] && <span className="field-error" id="order-name-error">{orderErrors["name"]}</span>}</div>
            <div className="form-field"><label htmlFor="order-phone">Mobile Number</label><div className="phone-input"><span aria-hidden="true">+ 91</span><input id="order-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="10-digit number" maxLength={18} aria-invalid={Boolean(orderErrors["phone"])} aria-describedby={orderErrors["phone"] ? "order-phone-error" : undefined} /></div>{orderErrors["phone"] && <span className="field-error" id="order-phone-error">{orderErrors["phone"]}</span>}</div>
            <div className="form-field"><label htmlFor="order-address">Delivery address</label><input id="order-address" name="address" placeholder="House no., street, area" autoComplete="street-address" maxLength={240} aria-invalid={Boolean(orderErrors["address"])} aria-describedby={orderErrors["address"] ? "order-address-error" : undefined} />{orderErrors["address"] && <span className="field-error" id="order-address-error">{orderErrors["address"]}</span>}</div>
            <div className="form-field"><label htmlFor="order-pincode">Pincode</label><input id="order-pincode" name="pincode" type="text" inputMode="numeric" autoComplete="postal-code" placeholder="6-digit pincode" maxLength={6} aria-invalid={Boolean(orderErrors["pincode"])} aria-describedby={orderErrors["pincode"] ? "order-pincode-error" : undefined} />{orderErrors["pincode"] && <span className="field-error" id="order-pincode-error">{orderErrors["pincode"]}</span>}</div>
            <fieldset className="payment-fieldset"><legend>Payment Type</legend><div className="payment-choices"><Button type="button" variant={payment === "cod" ? "default" : "outline"} className={`payment-choice${payment === "cod" ? " is-selected" : ""}`} aria-pressed={payment === "cod"} onClick={() => setPayment("cod")}>💰 Pay on Delivery</Button><Button type="button" variant={payment === "online" ? "default" : "outline"} className={`payment-choice${payment === "online" ? " is-selected" : ""}`} aria-pressed={payment === "online"} onClick={() => setPayment("online")}>💳 Online (₹100 OFF)</Button></div></fieldset>
            <div className="field-total"><span>Total · free delivery</span><strong>₹{price.toLocaleString("en-IN")}</strong></div>
            {orderNotice && <p className={`form-notice${Object.keys(orderErrors).length ? " form-notice-error" : ""}`} role="status">{orderNotice}</p>}
            <Button type="submit" className="primary-action submit-order">Place Order - Free Delivery ✓</Button>
            <p className="privacy-note">Your details are used only to prepare this order.</p>
          </form>
        </div>
      </section>

      <section className="subscribe-section section-wrap" aria-labelledby="subscribe-title">
        <div className="subscribe-heading"><h2 id="subscribe-title">Unlock offers &amp;<br />subscribe for content</h2></div>
        <form className="subscribe-form subscription-reference-form" onSubmit={handleSubscriptionSubmit} noValidate aria-label="WhatsApp subscription form">
          <div className="subscription-input-row">
            <div className="form-field"><label className="sr-only" htmlFor="subscribe-phone">Mobile Number</label><input id="subscribe-phone" name="phone" type="tel" inputMode="tel" autoComplete="tel-national" placeholder="Enter Your Phone Number" maxLength={18} aria-invalid={Boolean(subscriptionErrors["phone"])} aria-describedby={subscriptionErrors["phone"] ? "subscribe-phone-error" : undefined} />{subscriptionErrors["phone"] && <span className="field-error" id="subscribe-phone-error">{subscriptionErrors["phone"]}</span>}</div>
            <Button type="submit" className="subscription-submit">SUBMIT</Button>
          </div>
          {subscriptionNotice && <p className={`form-notice${Object.keys(subscriptionErrors).length ? " form-notice-error" : ""}`} role="status">{subscriptionNotice}</p>}
        </form>
      </section>

      <footer className="site-footer">
        <div className="footer-accordion">
          <Button type="button" variant="ghost" className="footer-toggle" aria-expanded={openFooterPanel === "legal"} onClick={() => setOpenFooterPanel(openFooterPanel === "legal" ? null : "legal")}><span>Legal Disclaimer</span><ChevronDown aria-hidden="true" /></Button>
          {openFooterPanel === "legal" && <p className="footer-panel">Read the product label. Dietary supplements are not a substitute for a balanced diet. Individual results vary.</p>}
          <Button type="button" variant="ghost" className="footer-toggle" aria-expanded={openFooterPanel === "links"} onClick={() => setOpenFooterPanel(openFooterPanel === "links" ? null : "links")}><span>Quick Links</span><ChevronDown aria-hidden="true" /></Button>
          {openFooterPanel === "links" && <nav className="footer-panel footer-links" aria-label="Quick links"><a href="#offers">Offers</a><a href="#order">Order Now</a><a href="#top">Back to top</a></nav>}
        </div>
        <div className="social-links" aria-label="Social media"><a href="#top" aria-label="Facebook"><Facebook aria-hidden="true" /></a><a href="#top" aria-label="Instagram"><Instagram aria-hidden="true" /></a><a href="#top" className="pinterest-link" aria-label="Pinterest">P</a><a href="#top" aria-label="YouTube"><Youtube aria-hidden="true" /></a></div>
      </footer>

      <div className="sticky-order-bar"><div className="sticky-price"><span>YOUR SELECTED PACK</span><strong>₹{price.toLocaleString("en-IN")}</strong></div><Button type="button" className="sticky-order-button" onClick={scrollToOrder}>ORDER NOW - {payment === "cod" ? "COD" : "ONLINE"} ✓</Button></div>
    </main>
  );
}
