import React, { useEffect, useState } from 'react';
import { CheckCircle2, Mail, MapPin, Phone } from 'lucide-react';
import { useStudio } from '../context/StudioContext';
import { BLUEPRINT_LIMITS } from '../types/studio';

interface ContactSectionProps {
  preselectedService: string;
}

interface FormState {
  name: string;
  email: string;
  phone: string;
  eventDate: string;
  serviceName: string;
  location: string;
  message: string;
}

export function ContactSection({ preselectedService }: ContactSectionProps) {
  const { siteSettings, services, submitInquiry } = useStudio();

  const [form, setForm] = useState<FormState>({
    name: '',
    email: '',
    phone: '',
    eventDate: '',
    serviceName: preselectedService || services[0]?.title || 'Wedding Photography',
    location: '',
    message: '',
  });

  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');

  useEffect(() => {
    if (preselectedService) {
      setForm((prev) => ({ ...prev, serviceName: preselectedService }));
    }
  }, [preselectedService]);

  const validate = (): boolean => {
    const nextErrors: Partial<Record<keyof FormState, string>> = {};
    if (form.name.trim().length < 2) nextErrors.name = 'Please enter your full name.';
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
      nextErrors.email = 'Please enter a valid email address.';
    }
    if (form.phone.trim().length < 5) nextErrors.phone = 'Please provide a contact phone number.';
    if (form.eventDate.trim().length < 4) nextErrors.eventDate = 'Please select an event or shoot date.';
    if (form.serviceName.trim().length < 2) nextErrors.serviceName = 'Please choose a photography service.';
    if (form.location.trim().length < 2) nextErrors.location = 'Please enter the shoot city or venue.';
    if (form.message.trim().length < 5) nextErrors.message = 'Please share a few details about your vision.';

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitError('');
    setSubmitSuccess(false);

    if (!validate()) return;

    setSubmitting(true);
    try {
      await submitInquiry(form);
      setSubmitSuccess(true);
      setForm({
        name: '',
        email: '',
        phone: '',
        eventDate: '',
        serviceName: services[0]?.title || 'Wedding Photography',
        location: '',
        message: '',
      });
    } catch {
      setSubmitError('We could not send your inquiry right now. Please try again or email us directly.');
    } finally {
      setSubmitting(false);
    }
  };

  const socialLinks = [
    { label: 'Instagram', url: siteSettings.instagramUrl },
    { label: 'Behance', url: siteSettings.behanceUrl },
    { label: 'Pinterest', url: siteSettings.pinterestUrl },
  ].filter((item) => Boolean(item.url));

  return (
    <section id="contact" className="bg-[#FAF8F5] text-[#111111] py-20 sm:py-28">
      <div className="max-w-[1400px] mx-auto px-5 sm:px-8 lg:px-12">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16">
          {/* Left Studio Information */}
          <div className="lg:col-span-5 flex flex-col justify-between">
            <div>
              <p className="text-xs uppercase tracking-[0.22em] text-[#786651] font-medium mb-3">
                Inquiries &amp; Commissions
              </p>
              <h2 className="font-editorial text-3xl sm:text-5xl leading-[1.06] text-[#111111] [text-wrap:balance]">
                Reserve Your Date With TWINS
              </h2>
              <p className="mt-5 text-[15px] leading-[1.75] text-[#4A4742] max-w-md">
                We accept a limited number of commissions each season to ensure personal attention
                from first moodboard to museum-grade print delivery.
              </p>

              <div className="mt-10 space-y-5 border-t border-[#E5DFD5] pt-8">
                <div className="flex items-start gap-3.5">
                  <Mail className="w-4 h-4 mt-1 text-[#786651] shrink-0" />
                  <div>
                    <p className="text-xs uppercase tracking-[0.14em] text-[#6E675E]">Studio Email</p>
                    <a
                      href={`mailto:${siteSettings.contactEmail}`}
                      className="text-sm font-medium text-[#111111] hover:text-[#786651] transition-colors"
                    >
                      {siteSettings.contactEmail}
                    </a>
                  </div>
                </div>

                {siteSettings.contactPhone && (
                  <div className="flex items-start gap-3.5">
                    <Phone className="w-4 h-4 mt-1 text-[#786651] shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[#6E675E]">Telephone</p>
                      <a
                        href={`tel:${siteSettings.contactPhone.replace(/\s+/g, '')}`}
                        className="text-sm font-medium text-[#111111] hover:text-[#786651] transition-colors"
                      >
                        {siteSettings.contactPhone}
                      </a>
                    </div>
                  </div>
                )}

                {siteSettings.studioAddress && (
                  <div className="flex items-start gap-3.5">
                    <MapPin className="w-4 h-4 mt-1 text-[#786651] shrink-0" />
                    <div>
                      <p className="text-xs uppercase tracking-[0.14em] text-[#6E675E]">Atelier</p>
                      <p className="text-sm text-[#111111]">{siteSettings.studioAddress}</p>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {socialLinks.length > 0 && (
              <div className="mt-10 pt-6 border-t border-[#E5DFD5]">
                <p className="text-xs uppercase tracking-[0.16em] text-[#6E675E] mb-3">
                  Follow Our Journal
                </p>
                <div className="flex flex-wrap items-center gap-5">
                  {socialLinks.map((social) => (
                    <a
                      key={social.label}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs uppercase tracking-[0.14em] font-medium text-[#111111] hover:text-[#786651] underline underline-offset-4 transition-colors"
                    >
                      {social.label}
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Right Booking Form */}
          <div className="lg:col-span-7">
            <form
              onSubmit={handleSubmit}
              noValidate
              className="bg-white border border-[#E5DFD5] p-6 sm:p-10"
            >
              {submitSuccess && (
                <div
                  role="status"
                  className="mb-8 p-5 bg-[#F4F1EA] border border-[#C8B69E] flex items-start gap-3"
                >
                  <CheckCircle2 className="w-5 h-5 text-[#5E4E3B] shrink-0 mt-0.5" />
                  <div>
                    <p className="font-editorial text-xl text-[#111111]">
                      Thank you. Your inquiry has been received.
                    </p>
                    <p className="mt-1 text-sm text-[#4A4742]">
                      Clara and Elena review every commission personally and will respond within 24
                      hours.
                    </p>
                  </div>
                </div>
              )}

              {submitError && (
                <div
                  role="alert"
                  className="mb-6 p-4 bg-red-50 border border-red-200 text-sm text-red-800"
                >
                  {submitError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div>
                  <label
                    htmlFor="booking-name"
                    className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-2"
                  >
                    Full Name *
                  </label>
                  <input
                    id="booking-name"
                    type="text"
                    required
                    maxLength={BLUEPRINT_LIMITS.NAME_MAX}
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    placeholder="Camille Laurent"
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DFD8CC] text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                  {errors.name && <p className="mt-1.5 text-xs text-red-700">{errors.name}</p>}
                </div>

                <div>
                  <label
                    htmlFor="booking-email"
                    className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-2"
                  >
                    Email Address *
                  </label>
                  <input
                    id="booking-email"
                    type="email"
                    required
                    maxLength={BLUEPRINT_LIMITS.EMAIL_MAX}
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    placeholder="camille@example.com"
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DFD8CC] text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                  {errors.email && <p className="mt-1.5 text-xs text-red-700">{errors.email}</p>}
                </div>

                <div>
                  <label
                    htmlFor="booking-phone"
                    className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-2"
                  >
                    Phone Number *
                  </label>
                  <input
                    id="booking-phone"
                    type="tel"
                    required
                    maxLength={BLUEPRINT_LIMITS.PHONE_MAX}
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+39 340 555 0192"
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DFD8CC] text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                  {errors.phone && <p className="mt-1.5 text-xs text-red-700">{errors.phone}</p>}
                </div>

                <div>
                  <label
                    htmlFor="booking-date"
                    className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-2"
                  >
                    Event / Shoot Date *
                  </label>
                  <input
                    id="booking-date"
                    type="date"
                    required
                    maxLength={BLUEPRINT_LIMITS.DATE_MAX}
                    value={form.eventDate}
                    onChange={(e) => setForm({ ...form, eventDate: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DFD8CC] text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                  {errors.eventDate && (
                    <p className="mt-1.5 text-xs text-red-700">{errors.eventDate}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-service"
                    className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-2"
                  >
                    Photography Service *
                  </label>
                  <select
                    id="booking-service"
                    value={form.serviceName}
                    onChange={(e) => setForm({ ...form, serviceName: e.target.value })}
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DFD8CC] text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
                  >
                    {services.map((srv) => (
                      <option key={srv.id} value={srv.title}>
                        {srv.title}
                      </option>
                    ))}
                  </select>
                  {errors.serviceName && (
                    <p className="mt-1.5 text-xs text-red-700">{errors.serviceName}</p>
                  )}
                </div>

                <div>
                  <label
                    htmlFor="booking-location"
                    className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-2"
                  >
                    Location / Destination *
                  </label>
                  <input
                    id="booking-location"
                    type="text"
                    required
                    maxLength={BLUEPRINT_LIMITS.LOCATION_MAX}
                    value={form.location}
                    onChange={(e) => setForm({ ...form, location: e.target.value })}
                    placeholder="Lake Como, Italy"
                    className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DFD8CC] text-sm text-[#111111] focus:border-[#111111] focus:outline-none"
                  />
                  {errors.location && (
                    <p className="mt-1.5 text-xs text-red-700">{errors.location}</p>
                  )}
                </div>
              </div>

              <div className="mt-6">
                <label
                  htmlFor="booking-message"
                  className="block text-xs uppercase tracking-[0.12em] text-[#4A4742] mb-2"
                >
                  Tell Us About Your Vision *
                </label>
                <textarea
                  id="booking-message"
                  rows={5}
                  required
                  maxLength={BLUEPRINT_LIMITS.MESSAGE_MAX}
                  value={form.message}
                  onChange={(e) => setForm({ ...form, message: e.target.value })}
                  placeholder="Share your celebration timeline, creative mood, or commercial brief..."
                  className="w-full px-4 py-3 bg-[#FAF8F5] border border-[#DFD8CC] text-sm text-[#111111] focus:border-[#111111] focus:outline-none resize-y"
                />
                {errors.message && <p className="mt-1.5 text-xs text-red-700">{errors.message}</p>}
              </div>

              <div className="mt-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <p className="text-xs text-[#6E675E]">
                  All inquiries are stored privately and never shared with third parties.
                </p>

                <button
                  type="submit"
                  disabled={submitting}
                  className="px-8 py-3.5 text-xs uppercase tracking-[0.14em] font-medium bg-[#111111] text-[#FAF8F5] hover:bg-[#3A3733] disabled:opacity-50 transition-colors whitespace-nowrap shrink-0 cursor-pointer"
                >
                  {submitting ? 'Submitting Inquiry...' : 'Submit Inquiry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
}
