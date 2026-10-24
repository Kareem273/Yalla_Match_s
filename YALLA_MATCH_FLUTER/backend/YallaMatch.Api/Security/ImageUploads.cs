namespace YallaMatch.Api.Security;

public static class ImageUploads
{
    public const long MaxImageSizeBytes = 5 * 1024 * 1024;

    public static bool TryValidate(IFormFile? file, out string contentType, out string extension, out string error)
    {
        contentType = string.Empty;
        extension = string.Empty;
        error = string.Empty;

        if (file is null || file.Length == 0)
        {
            error = "An image file is required.";
            return false;
        }

        if (file.Length > MaxImageSizeBytes)
        {
            error = "Image files must be 5 MB or smaller.";
            return false;
        }

        using var stream = file.OpenReadStream();
        Span<byte> signature = stackalloc byte[12];
        var bytesRead = stream.Read(signature);
        if (bytesRead < 3)
        {
            error = "The uploaded file is not a supported image.";
            return false;
        }

        if (bytesRead >= 8 && signature[..8].SequenceEqual(new byte[] { 137, 80, 78, 71, 13, 10, 26, 10 }))
        {
            contentType = "image/png";
            extension = ".png";
            return true;
        }

        if (signature[0] == 0xFF && signature[1] == 0xD8 && signature[2] == 0xFF)
        {
            contentType = "image/jpeg";
            extension = ".jpg";
            return true;
        }

        if (bytesRead >= 12 && signature[..4].SequenceEqual("RIFF"u8) && signature[8..12].SequenceEqual("WEBP"u8))
        {
            contentType = "image/webp";
            extension = ".webp";
            return true;
        }

        error = "Only PNG, JPEG, and WebP images are allowed.";
        return false;
    }
}
