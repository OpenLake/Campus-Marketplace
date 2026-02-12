import { Facebook, Twitter, Link2, Mail } from "lucide-react";
import toast from "react-hot-toast";

/**
 * ShareButtons Component
 * Social media sharing options
 */
const ShareButtons = ({ listing }) => {
  const shareUrl = window.location.href;
  const shareTitle = listing.title;
  const shareText = `Check out this ${listing.title} for ₹${listing.price}!`;

  const copyLink = () => {
    navigator.clipboard.writeText(shareUrl);
    toast.success("Link copied to clipboard!");
  };

  const shareOnFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(
      shareUrl
    )}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareOnTwitter = () => {
    const url = `https://twitter.com/intent/tweet?url=${encodeURIComponent(
      shareUrl
    )}&text=${encodeURIComponent(shareText)}`;
    window.open(url, "_blank", "width=600,height=400");
  };

  const shareViaEmail = () => {
    const subject = encodeURIComponent(`Check out: ${shareTitle}`);
    const body = encodeURIComponent(`${shareText}\n\n${shareUrl}`);
    window.location.href = `mailto:?subject=${subject}&body=${body}`;
  };

  return (
    <div className="flex items-center gap-2">
      <span className="text-sm font-medium text-gray-700">Share:</span>

      <button
        onClick={copyLink}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Copy link"
      >
        <Link2 className="h-5 w-5 text-gray-600" />
      </button>

      <button
        onClick={shareOnFacebook}
        className="p-2 hover:bg-blue-50 rounded-lg transition-colors"
        title="Share on Facebook"
      >
        <Facebook className="h-5 w-5 text-blue-600" />
      </button>

      <button
        onClick={shareOnTwitter}
        className="p-2 hover:bg-sky-50 rounded-lg transition-colors"
        title="Share on Twitter"
      >
        <Twitter className="h-5 w-5 text-sky-500" />
      </button>

      <button
        onClick={shareViaEmail}
        className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        title="Share via Email"
      >
        <Mail className="h-5 w-5 text-gray-600" />
      </button>
    </div>
  );
};

export default ShareButtons;
