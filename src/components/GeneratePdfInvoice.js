import React, { useRef, useState, useEffect } from "react";
import moment from "moment/moment";
import Swal from "sweetalert2";
import upiImage from "../upiImage.jpg";
import logo from "../logo-black.png";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import "sweetalert2/dist/sweetalert2.min.css";

const GeneratePdfInvoice = () => {
  const swalConfig = {
    customClass: {
      backdrop: "swal2-backdrop-show",
      popup: "swal2-popup-custom",
    },
    backdrop: true,
    allowOutsideClick: false,
    allowEscapeKey: false,
  };

  const optionsForTwo = {
    maximumFractionDigits: 2,
    minimumFractionDigits: 2,
  };
  const optionsForOne = {
    maximumFractionDigits: 1,
    minimumFractionDigits: 1,
  };

  const pdfRef = useRef();

  const [errMsg, setErrMsg] = useState("");
  const [invoiceNo, setInvoiceNo] = useState("");
  const [currentDate, setCurrentDate] = useState(new Date());
  const [dueDate, setdueDate] = useState(new Date());
  const [customerName, setCustomerName] = useState("");
  const [shippingLineFirst, setShippingLineFirst] = useState("");
  const [shippingLineSecond, setShippingLineSecond] = useState("");
  const [shippingLandmark, setShippingLandmark] = useState("");
  const [shippingCity, setShippingCity] = useState("Ahmedabad");
  const [shippingState, setShippingState] = useState("Gujarat");
  const [shippingPincode, setShippingPincode] = useState("");
  const [customerGst, setCustomerGst] = useState("");
  const [customerEmail, setCustomerEmail] = useState("");
  const [customerPhone, setCustomerPhone] = useState("");

  const [sameAsCustomerAddress, setSameAsCustomerAddress] = useState(false);
  const [billingLineFirst, setBillingLineFirst] = useState("");
  const [billingLineSecond, setBillingLineSecond] = useState("");
  const [billingLandmark, setBillingLandmark] = useState("");
  const [billingCity, setBillingCity] = useState("Ahmedabad");
  const [billingState, setBillingState] = useState("Gujarat");
  const [billingPincode, setBillingPincode] = useState("");
  const [itemList, setItemList] = useState([]);
  const [item, setItem] = useState("");
  const [itemDescriptions, setItemDescriptions] = useState([""]);
  const [rate, setRate] = useState(0.0);
  const [qty, setQty] = useState(0);
  const [sac, setSac] = useState("");
  const [gst, setGst] = useState(0.0);
  const [totalTax, seTotalTax] = useState(0.0);
  const [totalTaxableAmount, setTotalTaxableAmount] = useState(0.0);
  const [validationErrors, setValidationErrors] = useState({});
  const [fieldTouched, setFieldTouched] = useState({});
  const [isGeneratingPDF, setIsGeneratingPDF] = useState(false);

  const validateInvoiceNo = (value) => {
    if (!value || !value.trim()) return "Invoice number is required";
    if (value.trim().length < 1)
      return "Invoice number must be at least 1 characters";
    if (value.trim().length > 20)
      return "Invoice number must be less than 20 characters";
    if (!/^[0-9]+$/.test(value.trim()))
      return "Invoice number can only contain numbers";
    return "";
  };

  const validateCustomerName = (value) => {
    if (!value || !value.trim()) return "Customer name is required";
    if (value.trim().length < 2)
      return "Customer name must be at least 2 characters";
    if (value.trim().length > 100)
      return "Customer name must be less than 100 characters";
    if (!/^[A-Za-z\s]+$/.test(value.trim()))
      return "Customer name can only contain letters and spaces";
    return "";
  };

  const validateGST = (value) => {
    // if (!value || !value.trim()) return "GST number is required";

    const gstRegex =
      /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/;
    if (!value || !value.trim()) return "";
    if (!gstRegex.test(value.trim().toUpperCase())) {
      return "Please enter a valid GST number (e.g., 24CDDPG6235K1ZM)";
    }
    return "";
  };

  const validatePincode = (value) => {
    if (!value || !value.trim()) return "Pincode is required";
    if (!/^[0-9]{6}$/.test(value.trim()))
      return "Pincode must be exactly 6 digits";
    return "";
  };

  const validateCity = (value) => {
    if (!value || !value.trim()) return "City is required";
    if (value.trim().length < 2)
      return "City name must be at least 2 characters";
    if (value.trim().length > 50)
      return "City name must be less than 50 characters";
    if (!/^[A-Za-z\s]+$/.test(value.trim()))
      return "City name can only contain letters and spaces";
    return "";
  };

  const validateState = (value) => {
    if (!value || !value.trim()) return "State is required";
    if (value.trim().length < 2)
      return "State name must be at least 2 characters";
    if (value.trim().length > 50)
      return "State name must be less than 50 characters";
    if (!/^[A-Za-z\s]+$/.test(value.trim()))
      return "State name can only contain letters and spaces";
    return "";
  };

  const validateItemName = (value) => {
    if (!value || !value.trim()) return "Item name is required";
    if (value.trim().length < 2)
      return "Item name must be at least 2 characters";
    if (value.trim().length > 100)
      return "Item name must be less than 100 characters";
    if (!/^[A-Za-z0-9\s\-_.,&()]+$/.test(value.trim()))
      return "Item name can only contain letters, numbers, spaces, hyphens, underscores, dots, commas, ampersands, and parentheses";
    return "";
  };

  const validateItemDescription = (value) => {
    if (!value || !value.trim()) return "";
    if (value.trim().length > 200)
      return "Description must be less than 200 characters";
    return "";
  };

  const validateRate = (value) => {
    if (!value || value <= 0) return "Rate must be greater than 0";
    if (value > 999999.99) return "Rate cannot exceed 999,999.99";
    if (isNaN(parseFloat(value))) return "Rate must be a valid number";
    if (!/^\d+(\.\d{1,2})?$/.test(value.toString()))
      return "Rate can have maximum 2 decimal places";
    return "";
  };

  const validateQuantity = (value) => {
    if (!value || value <= 0) return "Quantity must be greater than 0";
    if (value > 999999) return "Quantity cannot exceed 999,999";
    if (!Number.isInteger(Number(value)))
      return "Quantity must be a whole number";
    if (isNaN(parseInt(value))) return "Quantity must be a valid number";
    if (!/^\d+$/.test(value.toString()))
      return "Quantity must be a whole number";
    return "";
  };

  const validateSAC = (value) => {
    if (!value || !value.trim()) return "SAC code is required";
    if (!/^[0-9]{6}$|^[0-9]{8}$/.test(value.trim()))
      return "SAC code must be exactly 6 or 8 digits";
    return "";
  };

  const validateGSTPercentage = (value) => {
    if (!value || value < 0) return "GST percentage must be 0 or greater";
    if (value > 100) return "GST percentage cannot exceed 100%";
    if (isNaN(parseFloat(value)))
      return "GST percentage must be a valid number";
    const validGSTRates = [0, 5, 12, 18, 28];
    if (!validGSTRates.includes(Number(value))) {
      return "GST percentage must be one of: 0%, 5%, 12%, 18%, 28%";
    }
    return "";
  };

  const validateEmail = (value) => {
    if (!value || !value.trim()) return "";
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(value.trim())) {
      return "Please enter a valid email address";
    }
    if (value.trim().length > 100)
      return "Email must be less than 100 characters";
    return "";
  };

  const validatePhone = (value) => {
    if (!value || !value.trim()) return "";
    const phoneRegex = /^(\+?[0-9]{1,3}[- ]?)?[0-9]{6,15}$/;
    if (!phoneRegex.test(value.trim().replace(/[\s-]/g, ""))) {
      return "Please enter a valid phone number (6-15 digits, with optional country code)";
    }
    if (value.trim().length > 20)
      return "Phone number must be less than 20 characters";
    return "";
  };

  const validateAddress = (line1, line2) => {
    if ((!line1 || !line1.trim()) && (!line2 || !line2.trim())) {
      return "At least one address line is required";
    }
    if (line1 && line1.trim().length > 100)
      return "Address line 1 must be less than 100 characters";
    if (line2 && line2.trim().length > 100)
      return "Address line 2 must be less than 100 characters";
    if (line1 && !/^[A-Za-z0-9\s\-_.,&()#/]+$/.test(line1.trim()))
      return "Address line 1 contains invalid characters";
    if (line2 && !/^[A-Za-z0-9\s\-_.,&()#/]+$/.test(line2.trim()))
      return "Address line 2 contains invalid characters";
    return "";
  };

  const validateBillingAddress = (line1, line2) => {
    if ((!line1 || !line1.trim()) && (!line2 || !line2.trim())) {
      return "At least one billing address line is required";
    }
    if (line1 && line1.trim().length > 100)
      return "Billing address line 1 must be less than 100 characters";
    if (line2 && line2.trim().length > 100)
      return "Billing address line 2 must be less than 100 characters";
    if (line1 && !/^[A-Za-z0-9\s\-_.,&()#/]+$/.test(line1.trim()))
      return "Billing address line 1 contains invalid characters";
    if (line2 && !/^[A-Za-z0-9\s\-_.,&()#/]+$/.test(line2.trim()))
      return "Billing address line 2 contains invalid characters";
    return "";
  };

  const validateInvoiceDate = (date) => {
    if (!date) return "Invoice date is required";
    if (!(date instanceof Date) || isNaN(date.getTime()))
      return "Please select a valid invoice date";

    return "";
  };

  const validateDueDate = (date, invoiceDate) => {
    if (!date) return "Due date is required";
    if (!(date instanceof Date) || isNaN(date.getTime()))
      return "Please select a valid due date";
    if (!invoiceDate) return "Please set invoice date first";

    if (date < invoiceDate) {
      return "Due date cannot be before invoice date";
    }

    const oneYearFromNow = new Date();
    oneYearFromNow.setFullYear(oneYearFromNow.getFullYear() + 1);
    if (date > oneYearFromNow) {
      return "Due date cannot be more than 1 year in the future";
    }

    return "";
  };

  const validateField = (fieldName, value, additionalValue = null) => {
    let error = "";

    switch (fieldName) {
      case "invoiceNo":
        error = validateInvoiceNo(value);
        break;
      case "customerName":
        error = validateCustomerName(value);
        break;
      case "customerGst":
        error = validateGST(value);
        break;
      case "customerEmail":
        error = validateEmail(value);
        break;
      case "customerPhone":
        error = validatePhone(value);
        break;
      case "shippingPincode":
        error = validatePincode(value);
        break;
      case "shippingCity":
        error = validateCity(value);
        break;
      case "shippingState":
        error = validateState(value);
        break;
      case "shippingAddress":
        error = validateAddress(value, additionalValue);
        break;
      case "shippingLandmark":
        error = "";
        break;
      case "item":
        error = validateItemName(value);
        break;
      case "rate":
        error = validateRate(value);
        break;
      case "qty":
        error = validateQuantity(value);
        break;
      case "sac":
        error = validateSAC(value);
        break;
      case "gst":
        error = validateGSTPercentage(value);
        break;
      case "billingAddress":
        error = validateBillingAddress(value, additionalValue);
        break;
      case "billingLandmark":
        error = "";
        break;
      case "billingCity":
        error = validateCity(value);
        break;
      case "billingState":
        error = validateState(value);
        break;
      case "billingPincode":
        error = validatePincode(value);
        break;
      case "invoiceDate":
        error = validateInvoiceDate(value);
        break;
      case "dueDate":
        error = validateDueDate(value, currentDate);
        break;
      default:
        error = "";
    }

    setValidationErrors((prev) => ({
      ...prev,
      [fieldName]: error,
    }));

    return error;
  };

  const handleFieldBlur = (fieldName, value, additionalValue = null) => {
    setFieldTouched((prev) => ({
      ...prev,
      [fieldName]: true,
    }));
    validateField(fieldName, value, additionalValue);
  };

  const getFieldValidationClass = (fieldName) => {
    if (!fieldTouched[fieldName]) return "";
    return validationErrors[fieldName] ? "is-invalid" : "";
  };

  const handleSameAddressChange = (checked) => {
    setSameAsCustomerAddress(checked);

    if (checked) {
      setShippingLineFirst(billingLineFirst);
      setShippingLineSecond(billingLineSecond);
      setShippingLandmark(billingLandmark);
      setShippingCity(billingCity);
      setShippingState(billingState);
      setShippingPincode(billingPincode);

      setValidationErrors((prev) => ({
        ...prev,
        shippingAddress: "",
        shippingLandmark: "",
        shippingCity: "",
        shippingState: "",
        shippingPincode: "",
      }));
    }
  };

  useEffect(() => {
    if (sameAsCustomerAddress) {
      setShippingLineFirst(billingLineFirst);
      setShippingLineSecond(billingLineSecond);
      setShippingLandmark(billingLandmark);
      setShippingCity(billingCity);
      setShippingState(billingState);
      setShippingPincode(billingPincode);

      setValidationErrors((prev) => ({
        ...prev,
        shippingAddress: "",
        shippingLandmark: "",
        shippingCity: "",
        shippingState: "",
        shippingPincode: "",
      }));
    }
  }, [
    sameAsCustomerAddress,
    billingLineFirst,
    billingLineSecond,
    billingLandmark,
    billingCity,
    billingState,
    billingPincode,
  ]);

  useEffect(() => {
    setTotalTaxableAmount(0.0);
    seTotalTax(0.0);
    if (itemList.length > 0) {
      itemList.forEach((item) => {
        setTotalTaxableAmount(
          (totalTaxableAmount) =>
            parseFloat(item.itemTaxble) + parseFloat(totalTaxableAmount),
        );
        seTotalTax(
          (totalTax) => parseFloat(item.taxAmount) + parseFloat(totalTax),
        );
      });
    }
    setErrMsg("");
  }, [
    invoiceNo,
    dueDate,
    customerName,
    shippingLandmark,
    shippingLineFirst,
    shippingLineSecond,
    shippingCity,
    shippingState,
    shippingPincode,
    customerGst,
    customerEmail,
    customerPhone,
    itemList,
  ]);

  useEffect(() => {
    if (errMsg !== "") {
      Swal.fire({
        icon: "error",
        title: "Error",
        text: errMsg,
      }).then(function () {
        setErrMsg("");
      });
    }
  }, [errMsg]);

  const addItem = () => {
    setErrMsg("");

    setFieldTouched((prev) => ({
      ...prev,
      item: true,
      rate: true,
      qty: true,
      sac: true,
      gst: true,
    }));

    setValidationErrors((prev) => ({
      ...prev,
      item: validateItemName(item),
      rate: validateRate(rate),
      qty: validateQuantity(qty),
      sac: validateSAC(sac),
      gst: validateGSTPercentage(gst),
    }));

    const itemError = validateItemName(item);
    const rateError = validateRate(rate);
    const qtyError = validateQuantity(qty);
    const sacError = validateSAC(sac);
    const gstError = validateGSTPercentage(gst);

    const errors = [itemError, rateError, qtyError, sacError, gstError].filter(
      (error) => error !== "",
    );

    if (errors.length > 0) {
      Swal.fire({
        icon: "error",
        title: "Item Validation Errors",
        html: `<div style="text-align: left;">
                <p>Please fix the following errors:</p>
                <ul style="margin: 0; padding-left: 20px;">
                  ${errors.map((msg) => `<li>${msg}</li>`).join("")}
                </ul>
               </div>`,
        confirmButtonText: "OK",
        width: "500px",
        ...swalConfig,
      });
      return;
    }

    const isDuplicate = itemList.some(
      (existingItem) =>
        existingItem.itemName.toLowerCase() === item.toLowerCase(),
    );

    if (isDuplicate) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Item",
        html: `<div style="text-align: left;">
                 <p><strong>This item already exists in the list:</strong></p>
                 <p><strong>Item Name:</strong> ${item}</p>
                 <p><strong>Existing Items:</strong></p>
                 <ul style="margin: 0; padding-left: 20px;">
                   ${itemList
                     .filter(
                       (existingItem) =>
                         existingItem.itemName.toLowerCase() ===
                         item.toLowerCase(),
                     )
                     .map((existingItem) => `<li>${existingItem.itemName}</li>`)
                     .join("")}
                 </ul>
                 <p style="margin-top: 10px;">Please use a different name for this item.</p>
                </div>`,
        confirmButtonText: "OK",
        width: "500px",
        ...swalConfig,
      });
      return;
    }

    const nonEmptyDescriptions = itemDescriptions.filter(
      (desc) => desc.trim() !== "",
    );
    const uniqueDescriptions = [...new Set(nonEmptyDescriptions)];
    if (uniqueDescriptions.length !== nonEmptyDescriptions.length) {
      Swal.fire({
        icon: "warning",
        title: "Duplicate Descriptions",
        html: `<div style="text-align: left;">
                 <p><strong>Duplicate description lines detected:</strong></p>
                 <p>Please remove duplicate description lines before adding the item.</p>
                </div>`,
        confirmButtonText: "OK",
        width: "500px",
        ...swalConfig,
      });
      return;
    }

    setItemList((itemList) => [
      ...itemList,
      {
        itemName: item.trim(),
        itemDescriptions: itemDescriptions.filter((desc) => desc.trim() !== ""),
        itemRate: parseFloat(rate),
        itemQty: parseFloat(qty),
        itemSac: sac.trim(),
        itemGst: parseFloat(gst),
        itemTaxble: parseFloat(rate * qty),
        taxAmount: parseFloat((gst * qty * rate) / 100),
        amount: parseFloat(rate * qty + (gst * qty * rate) / 100),
      },
    ]);

    Swal.fire({
      icon: "success",
      title: "Item Added Successfully",
      text: `${item.trim()} has been added to the invoice.`,
      timer: 2000,
      showConfirmButton: false,
      ...swalConfig,
    });

    setItem("");
    setItemDescriptions([""]);
    setRate(0.0);
    setQty(0);
    setSac("");
    setGst(0.0);

    setValidationErrors((prev) => ({
      ...prev,
      item: "",
      rate: "",
      qty: "",
      sac: "",
      gst: "",
    }));
  };

  const updateItemInList = (index, field, value) => {
    const updatedList = [...itemList];
    const item = updatedList[index];

    switch (field) {
      case "itemName":
        item.itemName = value;
        break;

      case "itemDescriptions":
        item.itemDescriptions = value;
        break;
      case "itemRate":
        item.itemRate = parseFloat(value) || 0;
        break;
      case "itemQty":
        item.itemQty = parseFloat(value) || 0;
        break;
      case "itemSac":
        item.itemSac = value;
        break;
      case "itemGst":
        item.itemGst = parseFloat(value) || 0;
        break;
      default:
        return;
    }

    item.itemTaxble = parseFloat(item.itemRate * item.itemQty);
    item.taxAmount = parseFloat(
      (item.itemGst * item.itemQty * item.itemRate) / 100,
    );
    item.amount = parseFloat(item.itemTaxble + item.taxAmount);

    setItemList(updatedList);
  };

  const [tableValidationErrors, setTableValidationErrors] = useState({});

  const validateTableItemField = (index, field, value) => {
    const error = validateItemField(field, value, index);

    setTableValidationErrors((prev) => ({
      ...prev,
      [`${index}_${field}`]: error,
    }));

    return error;
  };

  const getTableFieldValidationClass = (index, field) => {
    const errorKey = `${index}_${field}`;
    return tableValidationErrors[errorKey] ? "is-invalid" : "";
  };

  const validateItemField = (field, value, index) => {
    let error = "";

    switch (field) {
      case "itemName":
        error = validateItemName(value);
        break;

      case "itemDescriptions":
        error = validateItemDescription(value);
        break;
      case "itemRate":
        error = validateRate(value);
        break;
      case "itemQty":
        error = validateQuantity(value);
        break;
      case "itemSac":
        error = validateSAC(value);
        break;
      case "itemGst":
        error = validateGSTPercentage(value);
        break;
      default:
        return "";
    }

    return error;
  };

  const validateEntireForm = () => {
    const errors = {};

    errors.invoiceNo = validateInvoiceNo(invoiceNo);
    errors.invoiceDate = validateInvoiceDate(currentDate);
    errors.dueDate = validateDueDate(dueDate, currentDate);

    errors.customerName = validateCustomerName(customerName);
    errors.customerGst = validateGST(customerGst);
    errors.shippingPincode = validatePincode(shippingPincode);
    errors.shippingCity = validateCity(shippingCity);
    errors.shippingState = validateState(shippingState);
    errors.shippingAddress = validateAddress(
      shippingLineFirst,
      shippingLineSecond,
    );

    errors.billingAddress = validateBillingAddress(
      billingLineFirst,
      billingLineSecond,
    );
    errors.billingCity = validateCity(billingCity);
    errors.billingState = validateState(billingState);
    errors.billingPincode = validatePincode(billingPincode);

    if (itemList.length === 0) {
      errors.items = "Please add at least one item to the invoice";
    } else {
      const itemErrors = [];

      const itemNames = itemList.map((item) => item.itemName.toLowerCase());
      const uniqueItemNames = [...new Set(itemNames)];
      if (uniqueItemNames.length !== itemNames.length) {
        const duplicates = itemNames.filter(
          (name, index) => itemNames.indexOf(name) !== index,
        );
        const uniqueDuplicates = [...new Set(duplicates)];
        errors.items = `Duplicate item names found: ${uniqueDuplicates.join(
          ", ",
        )}`;
        return errors;
      }

      itemList.forEach((itemData, index) => {
        if (!itemData.itemName || itemData.itemName.trim() === "") {
          itemErrors.push(`Item ${index + 1}: Item name is required`);
        }
        if (!itemData.itemRate || itemData.itemRate <= 0) {
          itemErrors.push(`Item ${index + 1}: Rate must be greater than 0`);
        }
        if (!itemData.itemQty || itemData.itemQty <= 0) {
          itemErrors.push(`Item ${index + 1}: Quantity must be greater than 0`);
        }
        if (!itemData.itemSac || itemData.itemSac.trim() === "") {
          itemErrors.push(`Item ${index + 1}: SAC code is required`);
        }
        if (!itemData.itemGst || itemData.itemGst < 0) {
          itemErrors.push(`Item ${index + 1}: GST percentage is required`);
        }

        if (itemData.itemDescriptions && itemData.itemDescriptions.length > 0) {
          const nonEmptyDescriptions = itemData.itemDescriptions.filter(
            (desc) => desc.trim() !== "",
          );
          const uniqueDescriptions = [...new Set(nonEmptyDescriptions)];
          if (uniqueDescriptions.length !== nonEmptyDescriptions.length) {
            itemErrors.push(
              `Item ${index + 1}: Contains duplicate description lines`,
            );
          }
        }
      });
      if (itemErrors.length > 0) {
        errors.items = itemErrors.join("; ");
      }
    }

    return errors;
  };

  const getAllValidationErrors = () => {
    const allErrors = validateEntireForm();
    const errorMessages = [];

    Object.entries(allErrors).forEach(([field, error]) => {
      if (error && error !== "") {
        errorMessages.push(error);
      }
    });

    return errorMessages;
  };

  const handleSubmit = () => {
    setErrMsg("");

    const allErrors = validateEntireForm();

    setFieldTouched({
      invoiceNo: true,
      customerName: true,
      customerGst: true,
      shippingPincode: true,
      shippingCity: true,
      shippingState: true,
      shippingAddress: true,
      invoiceDate: true,
      dueDate: true,
      billingAddress: true,
      billingCity: true,
      billingState: true,
      billingPincode: true,
    });

    setValidationErrors(allErrors);

    const hasErrors = Object.values(allErrors).some((error) => error !== "");

    if (hasErrors) {
      const errorMessages = getAllValidationErrors();
      Swal.fire({
        icon: "error",
        title: "Form Validation Errors",
        html: `<div style="text-align: left; max-height: 400px; overflow-y: auto;">
              <p><strong>Please fix the following errors before generating PDF:</strong></p>
              <ul style="margin: 0; padding-left: 20px; font-size: 14px;">
                ${errorMessages
                  .map((msg) => `<li style="margin-bottom: 8px;">${msg}</li>`)
                  .join("")}
              </ul>
             </div>`,
        confirmButtonText: "OK",
        width: "600px",
        ...swalConfig,
      });

      setTimeout(() => {
        const firstErrorField = document.querySelector(".is-invalid");
        if (firstErrorField) {
          firstErrorField.scrollIntoView({
            behavior: "smooth",
            block: "center",
          });
          firstErrorField.focus();
        }
      }, 100);

      return;
    }

    Swal.fire({
      icon: "question",
      title: "Generate PDF Invoice",
      text: `Are you sure you want to generate PDF for invoice ${invoiceNo}?`,
      showCancelButton: true,
      confirmButtonText: "Yes, Generate PDF",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#007bff",
      cancelButtonColor: "#6c757d",
      ...swalConfig,
    }).then((result) => {
      if (result.isConfirmed) {
        setIsGeneratingPDF(true);

        Swal.fire({
          icon: "info",
          title: "Generating PDF...",
          text: "Please wait while we generate your invoice PDF.",
          allowOutsideClick: false,
          allowEscapeKey: false,
          showConfirmButton: false,
          didOpen: () => {
            Swal.showLoading();
          },
          ...swalConfig,
        });

        grtPdf();
      }
    });
  };

  const removeItem = (item) => {
    Swal.fire({
      icon: "warning",
      title: "Remove Item",
      html: `<div style="text-align: center;">
              <p><strong>Are you sure you want to remove this item?</strong></p>
              <p><strong>Item:</strong> ${item.itemName}</p>
              <p><strong>Rate:</strong> ₹${Intl.NumberFormat(
                "en-IN",
                optionsForTwo,
              ).format(item.itemRate)}</p>
              <p><strong>Quantity:</strong> ${Intl.NumberFormat(
                "en-IN",
                optionsForOne,
              ).format(item.itemQty)}</p>
              <p><strong>Amount:</strong> ₹${Intl.NumberFormat(
                "en-IN",
                optionsForTwo,
              ).format(item.amount)}</p>
             </div>`,
      showCancelButton: true,
      confirmButtonText: "Yes, Remove",
      cancelButtonText: "Cancel",
      confirmButtonColor: "#dc3545",
      cancelButtonColor: "#6c757d",
      width: "450px",
      ...swalConfig,
    }).then(function (result) {
      if (result.isConfirmed) {
        setItemList(
          itemList.filter((items) => items.itemName !== item.itemName),
        );

        Swal.fire({
          icon: "success",
          title: "Item Removed",
          text: `${item.itemName} has been removed from the invoice.`,
          timer: 2000,
          showConfirmButton: false,
          ...swalConfig,
        });
      }
    });
  };

  const grtPdf = () => {
    setTimeout(() => {
      if (!pdfRef.current) return;

      const printContent = pdfRef.current.innerHTML;
      const originalContent = document.body.innerHTML;
      const originalTitle = document.title;

      document.body.innerHTML = printContent;
      document.title = `ShivKrupaAC_${
        invoiceNo + "_" + moment().format("DD_MM_YYYY")
      }`;

      window.print();

      document.body.innerHTML = originalContent;
      document.title = originalTitle;
      Swal.close();
      window.location.reload();
    }, 100);
  };

  return (
    <>
      <style>
        {`
          .swal2-backdrop {
            background-color: rgba(0, 0, 0, 0.4) !important;
          }
          .swal2-backdrop-show {
            background-color: rgba(0, 0, 0, 0.4) !important;
          }
          .swal2-popup {
            background-color: white !important;
            border-radius: 8px !important;
          }
          .swal2-popup-custom {
            background-color: white !important;
            border-radius: 8px !important;
          }
        `}
      </style>
      <div className="container">
        <div
          ref={pdfRef}
          className="pdf-content p-5"
          style={{ border: "1px solid gray" }}
        >
          <section className="content">
            <div className="row justify-content-center">TAX INVOICE</div>
          </section>
          <section className="content">
            <div className="row">
              <div className="col-12">
                <h4>
                  <img
                    src={logo}
                    className="mt-3"
                    height={180}
                    width={450}
                    alt="logo"
                  />
                  <small className="float-right">ORIGINAL FOR RECIPIENT</small>
                </h4>
              </div>
            </div>
          </section>
          <section className="content">
            <div className="row justify-content-between">
              <div className="col-sm-4">
                <b>GSTIN :- 24CDDPG6235K1ZM</b>
                <br />
                52, 1ST FLOOR, INDRAJITBAG CO.OP.H.SOC.,
                <br />
                OPP.DIAMOND SILK MILLS,
                <br />
                NIKOL ROAD, THAKKARBAPA NAGAR
                <br />
                Ahmedabad, GUJARAT, 382350
                <br />
                Mobile :- 8238638933
              </div>
              <div className="col-sm-4">
                <br />
                <b>Invoice No. :- </b> {invoiceNo}
                <br />
                <b>Invoice Date :- </b>
                {currentDate.getDate() +
                  "/" +
                  (currentDate.getMonth() + 1) +
                  "/" +
                  currentDate.getFullYear()}
                <br />
                <b>Invoice Due Date :- </b>
                {dueDate.getDate() +
                  "/" +
                  (dueDate.getMonth() + 1) +
                  "/" +
                  dueDate.getFullYear()}
              </div>
            </div>
          </section>
          <br />
          <section className="content">
            <div className="row">
              <div className="col-sm-4">
                <b>Customer Details:</b>
                <br />
                <b>{customerName}</b>
                <br />
                <b>GSTIN : {customerGst}</b>
                {customerEmail && (
                  <>
                    <br />
                    <b>Email : {customerEmail}</b>
                  </>
                )}
                {customerPhone && (
                  <>
                    <br />
                    <b>Phone : {customerPhone}</b>
                  </>
                )}
                <br />
              </div>

              <div className="col-sm-4">
                <b>Billing Address:</b>
                <br />
                {billingLineFirst === "" ? "" : billingLineFirst + ","}
                {billingLineSecond === "" ? "" : billingLineSecond + ","}
                {billingLandmark === "" ? "" : billingLandmark + ","}
                <br />
                {billingCity},{billingState},{billingPincode}
              </div>

              <div className="col-sm-4">
                <b>Shipping Address:</b>
                <br />
                {sameAsCustomerAddress ? (
                  <>
                    {billingLineFirst === "" ? "" : billingLineFirst + ","}
                    {billingLineSecond === "" ? "" : billingLineSecond + ","}
                    {billingLandmark === "" ? "" : billingLandmark + ","}
                    <br />
                    {billingCity},{billingState},{billingPincode}
                  </>
                ) : (
                  <>
                    {shippingLineFirst === "" ? "" : shippingLineFirst + ","}
                    {shippingLineSecond === "" ? "" : shippingLineSecond + ","}
                    {shippingLandmark === "" ? "" : shippingLandmark + ","}
                    <br />
                    {shippingCity},{shippingState},{shippingPincode}
                  </>
                )}
              </div>
            </div>
          </section>
          <section className="content mt-4">
            <div className="row">
              <div className="col-sm-12">
                <table className="table">
                  <thead
                    style={{
                      border: "4px solid #e7afe7",
                      background: "#e7afe7",
                    }}
                  >
                    <tr
                      style={{
                        border: "4px solid #e7afe7",
                        background: "#e7afe7",
                      }}
                    >
                      <th style={{ background: "#e7afe7" }}>#</th>
                      <th style={{ background: "#e7afe7" }}>Item</th>
                      <th style={{ background: "#e7afe7" }}>HAN/SAC</th>
                      <th style={{ background: "#e7afe7" }}>Rate/Item</th>
                      <th style={{ background: "#e7afe7" }}>Qty</th>
                      <th style={{ background: "#e7afe7" }}>GST %</th>
                      <th style={{ background: "#e7afe7" }}>Taxable Value</th>
                      <th style={{ background: "#e7afe7" }}>Tax Amount</th>
                      <th style={{ background: "#e7afe7" }}>Amount</th>
                    </tr>
                  </thead>
                  <tbody>
                    {itemList.length > 0 &&
                      itemList.map((itemData, index) => (
                        <tr
                          key={index}
                          style={{
                            borderTop: "2px solid #e7afe7",
                            cursor: "pointer",
                          }}
                          onClick={() => removeItem(itemData)}
                          title="Click to remove this item"
                        >
                          <td>{index + 1}</td>
                          <td>
                            <div style={{ minWidth: "150px" }}>
                              {isGeneratingPDF ? (
                                <div
                                  style={{
                                    fontWeight: "bold",
                                  }}
                                >
                                  {itemData.itemName}
                                </div>
                              ) : (
                                <input
                                  type="text"
                                  value={itemData.itemName}
                                  onChange={(e) => {
                                    updateItemInList(
                                      index,
                                      "itemName",
                                      e.target.value,
                                    );
                                    validateTableItemField(
                                      index,
                                      "itemName",
                                      e.target.value,
                                    );
                                  }}
                                  onBlur={(e) =>
                                    validateTableItemField(
                                      index,
                                      "itemName",
                                      e.target.value,
                                    )
                                  }
                                  onClick={(e) => e.stopPropagation()}
                                  className={`form-control form-control-sm ${getTableFieldValidationClass(
                                    index,
                                    "itemName",
                                  )}`}
                                  style={{
                                    width: "100%",
                                    border: tableValidationErrors[
                                      `${index}_itemName`
                                    ]
                                      ? "1px solid #dc3545"
                                      : "none",
                                    background: "transparent",
                                    padding: "0",
                                    fontSize: "inherit",
                                    marginBottom: "5px",
                                  }}
                                  placeholder="Item Name"
                                />
                              )}
                              {(itemData.itemDescriptions || [""]).map(
                                (desc, descIndex) => (
                                  <div key={descIndex}>
                                    {isGeneratingPDF ? (
                                      <div
                                        style={{
                                          fontSize: "11px",
                                          marginBottom: "2px",
                                          lineHeight: "1.2",
                                          minHeight: "13px",
                                        }}
                                      >
                                        {desc}
                                      </div>
                                    ) : (
                                      <div
                                        style={{
                                          display: "flex",
                                          alignItems: "center",
                                        }}
                                      >
                                        <input
                                          type="text"
                                          value={desc}
                                          onChange={(e) => {
                                            const newDescriptions = [
                                              ...(itemData.itemDescriptions || [
                                                "",
                                              ]),
                                            ];
                                            newDescriptions[descIndex] =
                                              e.target.value;
                                            updateItemInList(
                                              index,
                                              "itemDescriptions",
                                              newDescriptions,
                                            );
                                            validateTableItemField(
                                              index,
                                              "itemDescriptions",
                                              e.target.value,
                                            );
                                          }}
                                          onBlur={(e) =>
                                            validateTableItemField(
                                              index,
                                              "itemDescriptions",
                                              e.target.value,
                                            )
                                          }
                                          onClick={(e) => e.stopPropagation()}
                                          className={`form-control form-control-sm ${getTableFieldValidationClass(
                                            index,
                                            "itemDescriptions",
                                          )}`}
                                          style={{
                                            flex: 1,
                                            border: tableValidationErrors[
                                              `${index}_itemDescriptions`
                                            ]
                                              ? "1px solid #dc3545"
                                              : "none",
                                            background: "transparent",
                                            padding: "2px 4px",
                                            fontSize: "11px",
                                            height: "20px",
                                          }}
                                          placeholder={`Description ${
                                            descIndex + 1
                                          } (optional)`}
                                        />
                                        <button
                                          type="button"
                                          className="btn btn-sm btn-outline-danger"
                                          onClick={(e) => {
                                            e.stopPropagation();
                                            const newDescriptions = (
                                              itemData.itemDescriptions || [""]
                                            ).filter((_, i) => i !== descIndex);
                                            updateItemInList(
                                              index,
                                              "itemDescriptions",
                                              newDescriptions.length > 0
                                                ? newDescriptions
                                                : [""],
                                            );
                                          }}
                                          style={{
                                            fontSize: "10px",
                                            padding: "1px 4px",
                                            marginLeft: "2px",
                                            height: "20px",
                                          }}
                                          title="Remove this description line"
                                        >
                                          ×
                                        </button>
                                      </div>
                                    )}
                                  </div>
                                ),
                              )}
                              {!isGeneratingPDF && (
                                <button
                                  type="button"
                                  className="btn btn-sm btn-outline-secondary"
                                  onClick={(e) => {
                                    e.stopPropagation();

                                    const currentDescriptions =
                                      itemData.itemDescriptions || [""];
                                    const nonEmptyDescriptions =
                                      currentDescriptions.filter(
                                        (desc) => desc.trim() !== "",
                                      );
                                    const uniqueDescriptions = [
                                      ...new Set(nonEmptyDescriptions),
                                    ];
                                    if (
                                      uniqueDescriptions.length !==
                                      nonEmptyDescriptions.length
                                    ) {
                                      Swal.fire({
                                        icon: "warning",
                                        title: "Duplicate Descriptions",
                                        html: `<div style="text-align: left;">
                                                  <p><strong>Duplicate description lines detected for item "${itemData.itemName}":</strong></p>
                                                  <p>Please remove duplicate description lines before adding a new one.</p>
                                                 </div>`,
                                        confirmButtonText: "OK",
                                        width: "500px",
                                        ...swalConfig,
                                      });
                                      return;
                                    }

                                    const newDescriptions = [
                                      ...currentDescriptions,
                                      "",
                                    ];
                                    updateItemInList(
                                      index,
                                      "itemDescriptions",
                                      newDescriptions,
                                    );
                                  }}
                                  style={{
                                    fontSize: "10px",
                                    padding: "1px 4px",
                                    marginTop: "2px",
                                    width: "100%",
                                  }}
                                  title="Add another description line"
                                >
                                  + Add Line
                                </button>
                              )}
                            </div>
                          </td>
                          <td>
                            {isGeneratingPDF ? (
                              <div style={{ fontWeight: "bold" }}>
                                {itemData.itemSac}
                              </div>
                            ) : (
                              <input
                                type="text"
                                value={itemData.itemSac}
                                onChange={(e) => {
                                  updateItemInList(
                                    index,
                                    "itemSac",
                                    e.target.value,
                                  );
                                  validateTableItemField(
                                    index,
                                    "itemSac",
                                    e.target.value,
                                  );
                                }}
                                onBlur={(e) =>
                                  validateTableItemField(
                                    index,
                                    "itemSac",
                                    e.target.value,
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                className={`form-control form-control-sm ${getTableFieldValidationClass(
                                  index,
                                  "itemSac",
                                )}`}
                                style={{
                                  minWidth: "80px",
                                  border: tableValidationErrors[
                                    `${index}_itemSac`
                                  ]
                                    ? "1px solid #dc3545"
                                    : "none",
                                  background: "transparent",
                                  padding: "0",
                                  fontSize: "inherit",
                                }}
                                placeholder="SAC Code"
                              />
                            )}
                          </td>
                          <td>
                            {isGeneratingPDF ? (
                              <div style={{ fontWeight: "bold" }}>
                                {Intl.NumberFormat(
                                  "en-IN",
                                  optionsForTwo,
                                ).format(itemData.itemRate)}
                              </div>
                            ) : (
                              <input
                                type="number"
                                step="0.01"
                                value={itemData.itemRate}
                                onChange={(e) => {
                                  updateItemInList(
                                    index,
                                    "itemRate",
                                    e.target.value,
                                  );
                                  validateTableItemField(
                                    index,
                                    "itemRate",
                                    e.target.value,
                                  );
                                }}
                                onBlur={(e) =>
                                  validateTableItemField(
                                    index,
                                    "itemRate",
                                    e.target.value,
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                className={`form-control form-control-sm ${getTableFieldValidationClass(
                                  index,
                                  "itemRate",
                                )}`}
                                style={{
                                  minWidth: "80px",
                                  border: tableValidationErrors[
                                    `${index}_itemRate`
                                  ]
                                    ? "1px solid #dc3545"
                                    : "none",
                                  background: "transparent",
                                  padding: "0",
                                  fontSize: "inherit",
                                }}
                              />
                            )}
                          </td>
                          <td>
                            {isGeneratingPDF ? (
                              <div style={{ fontWeight: "bold" }}>
                                {Intl.NumberFormat(
                                  "en-IN",
                                  optionsForOne,
                                ).format(itemData.itemQty)}
                              </div>
                            ) : (
                              <input
                                type="number"
                                value={itemData.itemQty}
                                onChange={(e) => {
                                  updateItemInList(
                                    index,
                                    "itemQty",
                                    e.target.value,
                                  );
                                  validateTableItemField(
                                    index,
                                    "itemQty",
                                    e.target.value,
                                  );
                                }}
                                onBlur={(e) =>
                                  validateTableItemField(
                                    index,
                                    "itemQty",
                                    e.target.value,
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                className={`form-control form-control-sm ${getTableFieldValidationClass(
                                  index,
                                  "itemQty",
                                )}`}
                                style={{
                                  minWidth: "60px",
                                  border: tableValidationErrors[
                                    `${index}_itemQty`
                                  ]
                                    ? "1px solid #dc3545"
                                    : "none",
                                  background: "transparent",
                                  padding: "0",
                                  fontSize: "inherit",
                                }}
                              />
                            )}
                          </td>

                          <td>
                            {isGeneratingPDF ? (
                              <div style={{ fontWeight: "bold" }}>
                                {Intl.NumberFormat(
                                  "en-IN",
                                  optionsForOne,
                                ).format(itemData.itemGst)}
                                %
                              </div>
                            ) : (
                              <input
                                type="number"
                                step="0.01"
                                value={itemData.itemGst}
                                onChange={(e) => {
                                  updateItemInList(
                                    index,
                                    "itemGst",
                                    e.target.value,
                                  );
                                  validateTableItemField(
                                    index,
                                    "itemGst",
                                    e.target.value,
                                  );
                                }}
                                onBlur={(e) =>
                                  validateTableItemField(
                                    index,
                                    "itemGst",
                                    e.target.value,
                                  )
                                }
                                onClick={(e) => e.stopPropagation()}
                                className={`form-control form-control-sm ${getTableFieldValidationClass(
                                  index,
                                  "itemGst",
                                )}`}
                                style={{
                                  minWidth: "60px",
                                  border: tableValidationErrors[
                                    `${index}_itemGst`
                                  ]
                                    ? "1px solid #dc3545"
                                    : "none",
                                  background: "transparent",
                                  padding: "0",
                                  fontSize: "inherit",
                                }}
                              />
                            )}
                          </td>
                          <td>
                            <b>
                              {Intl.NumberFormat("en-IN", optionsForTwo).format(
                                itemData.itemTaxble,
                              )}
                            </b>
                          </td>
                          <td>
                            <b>
                              {Intl.NumberFormat("en-IN", optionsForTwo).format(
                                itemData.taxAmount,
                              )}
                            </b>
                          </td>
                          <td>
                            <b>
                              {Intl.NumberFormat("en-IN", optionsForTwo).format(
                                itemData.amount,
                              )}
                            </b>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </div>
          </section>
          <section className="content text-right">
            <div className="row justify-content-end">
              <div className="col-sm-2">
                <b>Taxable Amount</b>
              </div>
              <div className="col-sm-2">
                ₹
                {Intl.NumberFormat("en-IN", optionsForTwo).format(
                  totalTaxableAmount,
                )}
              </div>
            </div>
            <div className="row justify-content-end">
              <div className="col-sm-2">CGST</div>
              <div className="col-sm-2">
                ₹
                {Intl.NumberFormat("en-IN", optionsForTwo).format(totalTax / 2)}
              </div>
            </div>
            <div className="row justify-content-end">
              <div className="col-sm-2">SGST</div>
              <div className="col-sm-2">
                ₹
                {Intl.NumberFormat("en-IN", optionsForTwo).format(totalTax / 2)}
              </div>
            </div>
            <div className="row justify-content-end">
              <div
                className="col-sm-2 text-lg"
                style={{ borderTop: "4px solid #e7afe7" }}
              >
                <b>Total</b>
              </div>
              <div
                className="col-sm-2 text-lg"
                style={{ borderTop: "4px solid #e7afe7" }}
              >
                <b>
                  ₹
                  {Intl.NumberFormat("en-IN", optionsForTwo).format(
                    totalTaxableAmount + totalTax,
                  )}
                </b>
              </div>
            </div>
          </section>

          <section
            className="content mt-4"
            style={{ borderTop: "4px solid #e7afe7" }}
          >
            <div className="row mt-4">
              <div className="col-sm-3">
                <b>Pay Using UPI:</b>

                <img
                  src={upiImage}
                  className="mt-3"
                  height={180}
                  width={180}
                  alt="upiImage"
                />
              </div>

              <div className="col-sm-6">
                <b>Bank Details:</b>

                <div className="row mt-3">
                  <div className="col-sm-3">Bank: </div>
                  <div className="col-sm-6">
                    <b>Axis Bank</b>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-3"> Account No: </div>
                  <div className="col-sm-6">
                    <b>921020038865048</b>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-3">IFSC:</div>
                  <div className="col-sm-6">
                    <b>UTIB0000664</b>
                  </div>
                </div>
                <div className="row">
                  <div className="col-sm-3">Branch</div>
                  <div className="col-sm-6">
                    <b>BAPUNAGAR, AHMEDABAD</b>
                  </div>
                </div>
              </div>
              <div className="col-sm-3 text-sm text-left">
                For SHIVKRUPA A.C. SALES & SERVICES
                <br />
                <br />
                <br />
                <br />
                <br />
                <br />
                Authorized signatory
              </div>
            </div>
          </section>
        </div>
        <div className="row justify-content-center my-4">
          <div className="col-md-10 text-center">
            <div
              className="d-flex justify-content-center"
              style={{ gap: "20px" }}
            >
              <button
                type="button"
                className="btn btn-primary btn-lg px-4 py-2"
                onClick={handleSubmit}
              >
                <i className="fas fa-download me-2"></i> Generate PDF Invoice
              </button>
              <button
                type="button"
                className="btn btn-secondary btn-lg px-4 py-2"
                onClick={() => {
                  Swal.fire({
                    icon: "question",
                    title: "Refresh Page",
                    text: "Are you sure you want to refresh the page? All unsaved data will be lost.",
                    showCancelButton: true,
                    confirmButtonText: "Yes, Refresh",
                    cancelButtonText: "Cancel",
                    confirmButtonColor: "#6c757d",
                    cancelButtonColor: "#007bff",
                    ...swalConfig,
                  }).then((result) => {
                    if (result.isConfirmed) {
                      window.location.reload();
                    }
                  });
                }}
              >
                <i className="fas fa-refresh me-2"></i> Refresh
              </button>
            </div>
          </div>
        </div>
        <section className="content">
          <div className="container-fluid">
            <div className="card card-primary">
              <div className="card-header">Add Invoice Details</div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="invoiceNo">Invoice No</label>
                          <input
                            type="text"
                            id="invoiceNo"
                            onChange={(e) => {
                              setInvoiceNo(e.target.value);
                              validateField("invoiceNo", e.target.value);
                            }}
                            onBlur={(e) =>
                              handleFieldBlur("invoiceNo", e.target.value)
                            }
                            value={invoiceNo}
                            placeholder="Invoice No"
                            required
                            className={`form-control ${getFieldValidationClass(
                              "invoiceNo",
                            )}`}
                          />
                          {fieldTouched.invoiceNo &&
                            validationErrors.invoiceNo && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.invoiceNo}
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="invoiceDueDate">Invoice Date</label>
                          <br />
                          <DatePicker
                            showIcon
                            id="invoiceDate"
                            className={`form-control ${getFieldValidationClass(
                              "invoiceDate",
                            )}`}
                            onChange={(date) => {
                              setCurrentDate(date);
                              validateField("invoiceDate", date);
                              if (dueDate) {
                                validateField("dueDate", dueDate);
                              }
                            }}
                            onBlur={() =>
                              handleFieldBlur("invoiceDate", currentDate)
                            }
                            selected={currentDate}
                            placeholder="Invoice Date"
                            dateFormat="dd/MM/yyyy"
                          />
                          {fieldTouched.invoiceDate &&
                            validationErrors.invoiceDate && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.invoiceDate}
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="invoiceDueDate">
                            Invoice Due Date
                          </label>
                          <br />
                          <DatePicker
                            showIcon
                            id="invoiceDueDate"
                            className={`form-control ${getFieldValidationClass(
                              "dueDate",
                            )}`}
                            onChange={(date) => {
                              setdueDate(date);
                              validateField("dueDate", date);
                            }}
                            onBlur={() => handleFieldBlur("dueDate", dueDate)}
                            selected={dueDate}
                            minDate={currentDate}
                            placeholder="Invoice Due Date"
                            dateFormat="dd/MM/yyyy"
                          />
                          {fieldTouched.dueDate && validationErrors.dueDate && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.dueDate}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        <section className="content">
          <div className="container-fluid">
            <div className="card card-primary">
              <div className="card-header">Customer Details</div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="customerName">Customer Name *</label>
                      <input
                        type="text"
                        id="customerName"
                        onChange={(e) => {
                          setCustomerName(e.target.value);
                          validateField("customerName", e.target.value);
                        }}
                        onBlur={(e) =>
                          handleFieldBlur("customerName", e.target.value)
                        }
                        value={customerName}
                        placeholder="Customer Name *"
                        required
                        className={`form-control ${getFieldValidationClass(
                          "customerName",
                        )}`}
                      />
                      {fieldTouched.customerName &&
                        validationErrors.customerName && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.customerName}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="customerGst">Customer GST</label>
                      <input
                        type="text"
                        id="customerGst"
                        onChange={(e) => {
                          setCustomerGst(e.target.value);
                          validateField("customerGst", e.target.value);
                        }}
                        onBlur={(e) =>
                          handleFieldBlur("customerGst", e.target.value)
                        }
                        value={customerGst}
                        placeholder="Customer GST * (e.g., 24CDDPG6235K1ZM)"
                        required
                        className={`form-control ${getFieldValidationClass(
                          "customerGst",
                        )}`}
                      />
                      {fieldTouched.customerGst &&
                        validationErrors.customerGst && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.customerGst}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="customerEmail">Customer Email</label>
                      <input
                        type="email"
                        id="customerEmail"
                        onChange={(e) => {
                          setCustomerEmail(e.target.value);
                          validateField("customerEmail", e.target.value);
                        }}
                        onBlur={(e) =>
                          handleFieldBlur("customerEmail", e.target.value)
                        }
                        value={customerEmail}
                        placeholder="customer@example.com"
                        className={`form-control ${getFieldValidationClass(
                          "customerEmail",
                        )}`}
                      />
                      {fieldTouched.customerEmail &&
                        validationErrors.customerEmail && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.customerEmail}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="customerPhone">Customer Phone</label>
                      <input
                        type="tel"
                        id="customerPhone"
                        onChange={(e) => {
                          setCustomerPhone(e.target.value);
                          validateField("customerPhone", e.target.value);
                        }}
                        onBlur={(e) =>
                          handleFieldBlur("customerPhone", e.target.value)
                        }
                        value={customerPhone}
                        placeholder="+91-9876543210 or 9876543210"
                        className={`form-control ${getFieldValidationClass(
                          "customerPhone",
                        )}`}
                      />
                      {fieldTouched.customerPhone &&
                        validationErrors.customerPhone && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.customerPhone}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="card card-info">
              <div className="card-header">Billing Address</div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="billingLineFirst">Address Line 1 *</label>
                      <input
                        type="text"
                        id="billingLineFirst"
                        onChange={(e) => {
                          setBillingLineFirst(e.target.value);
                          validateField(
                            "billingAddress",
                            e.target.value,
                            billingLineSecond,
                          );
                        }}
                        onBlur={(e) =>
                          handleFieldBlur(
                            "billingAddress",
                            e.target.value,
                            billingLineSecond,
                          )
                        }
                        value={billingLineFirst}
                        placeholder="Address Line 1 *"
                        required
                        className={`form-control ${getFieldValidationClass(
                          "billingAddress",
                        )}`}
                      />
                      {fieldTouched.billingAddress &&
                        validationErrors.billingAddress && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.billingAddress}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="billingLineSecond">Address Line 2</label>
                      <input
                        type="text"
                        id="billingLineSecond"
                        onChange={(e) => {
                          setBillingLineSecond(e.target.value);
                          validateField(
                            "billingAddress",
                            billingLineFirst,
                            e.target.value,
                          );
                        }}
                        onBlur={(e) =>
                          handleFieldBlur(
                            "billingAddress",
                            billingLineFirst,
                            e.target.value,
                          )
                        }
                        value={billingLineSecond}
                        placeholder="Address Line 2 (Optional)"
                        className={`form-control ${getFieldValidationClass(
                          "billingAddress",
                        )}`}
                      />
                      {fieldTouched.billingAddress &&
                        validationErrors.billingAddress && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.billingAddress}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="billingLandmark">Landmark</label>
                      <input
                        type="text"
                        id="billingLandmark"
                        onChange={(e) => {
                          setBillingLandmark(e.target.value);
                        }}
                        value={billingLandmark}
                        placeholder="Landmark (Optional)"
                        className="form-control"
                      />
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="billingCity">City *</label>
                      <input
                        type="text"
                        id="billingCity"
                        onChange={(e) => {
                          setBillingCity(e.target.value);
                          validateField("billingCity", e.target.value);
                        }}
                        onBlur={(e) =>
                          handleFieldBlur("billingCity", e.target.value)
                        }
                        value={billingCity}
                        placeholder="City *"
                        required
                        className={`form-control ${getFieldValidationClass(
                          "billingCity",
                        )}`}
                      />
                      {fieldTouched.billingCity &&
                        validationErrors.billingCity && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.billingCity}
                          </div>
                        )}
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className="form-group">
                      <label htmlFor="billingState">State *</label>
                      <input
                        type="text"
                        id="billingState"
                        onChange={(e) => {
                          setBillingState(e.target.value);
                          validateField("billingState", e.target.value);
                        }}
                        onBlur={(e) =>
                          handleFieldBlur("billingState", e.target.value)
                        }
                        value={billingState}
                        placeholder="State *"
                        required
                        className={`form-control ${getFieldValidationClass(
                          "billingState",
                        )}`}
                      />
                      {fieldTouched.billingState &&
                        validationErrors.billingState && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.billingState}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
                <div className="row">
                  <div className="col-md-6">
                    <div className="form-group">
                      <label htmlFor="billingPincode">Pincode</label>
                      <input
                        type="text"
                        id="billingPincode"
                        onChange={(e) => {
                          setBillingPincode(e.target.value);
                          validateField("billingPincode", e.target.value);
                        }}
                        onBlur={(e) =>
                          handleFieldBlur("billingPincode", e.target.value)
                        }
                        value={billingPincode}
                        placeholder="Pincode (6 digits)"
                        required
                        className={`form-control ${getFieldValidationClass(
                          "billingPincode",
                        )}`}
                      />
                      {fieldTouched.billingPincode &&
                        validationErrors.billingPincode && (
                          <div className="invalid-feedback d-block">
                            {validationErrors.billingPincode}
                          </div>
                        )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="content">
          <div className="container-fluid">
            <div className="card card-success">
              <div className="card-header">Shipping Address</div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="form-group">
                      <div className="custom-control custom-checkbox">
                        <input
                          type="checkbox"
                          className="custom-control-input"
                          id="sameAsCustomerAddress"
                          checked={sameAsCustomerAddress}
                          onChange={(e) =>
                            handleSameAddressChange(e.target.checked)
                          }
                        />
                        <label
                          className="custom-control-label"
                          htmlFor="sameAsCustomerAddress"
                        >
                          Same as Billing Address
                        </label>
                      </div>
                    </div>
                  </div>
                </div>

                {!sameAsCustomerAddress && (
                  <>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="shippingLineFirst">
                            Address Line 1 *
                          </label>
                          <input
                            type="text"
                            id="shippingLineFirst"
                            onChange={(e) => {
                              setShippingLineFirst(e.target.value);
                              validateField(
                                "shippingAddress",
                                e.target.value,
                                shippingLineSecond,
                              );
                            }}
                            onBlur={(e) =>
                              handleFieldBlur(
                                "shippingAddress",
                                e.target.value,
                                shippingLineSecond,
                              )
                            }
                            value={shippingLineFirst}
                            placeholder="Address Line 1 *"
                            required
                            className={`form-control ${getFieldValidationClass(
                              "shippingAddress",
                            )}`}
                          />
                          {fieldTouched.shippingAddress &&
                            validationErrors.shippingAddress && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.shippingAddress}
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="shippingLineSecond">
                            Address Line 2
                          </label>
                          <input
                            type="text"
                            id="shippingLineSecond"
                            onChange={(e) => {
                              setShippingLineSecond(e.target.value);
                              validateField(
                                "shippingAddress",
                                shippingLineFirst,
                                e.target.value,
                              );
                            }}
                            onBlur={(e) =>
                              handleFieldBlur(
                                "shippingAddress",
                                shippingLineFirst,
                                e.target.value,
                              )
                            }
                            value={shippingLineSecond}
                            placeholder="Address Line 2 (Optional)"
                            className="form-control"
                          />
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="shippingLandmark">Landmark</label>
                          <input
                            type="text"
                            id="shippingLandmark"
                            onChange={(e) => {
                              setShippingLandmark(e.target.value);
                              validateField("shippingLandmark", e.target.value);
                            }}
                            onBlur={(e) =>
                              handleFieldBlur(
                                "shippingLandmark",
                                e.target.value,
                              )
                            }
                            value={shippingLandmark}
                            placeholder="Landmark (Optional)"
                            className="form-control"
                          />
                          {fieldTouched.shippingLandmark &&
                            validationErrors.shippingLandmark && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.shippingLandmark}
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="shippingCity">City *</label>
                          <input
                            type="text"
                            id="shippingCity"
                            onChange={(e) => {
                              setShippingCity(e.target.value);
                              validateField("shippingCity", e.target.value);
                            }}
                            onBlur={(e) =>
                              handleFieldBlur("shippingCity", e.target.value)
                            }
                            value={shippingCity}
                            placeholder="City *"
                            required
                            className={`form-control ${getFieldValidationClass(
                              "shippingCity",
                            )}`}
                          />
                          {fieldTouched.shippingCity &&
                            validationErrors.shippingCity && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.shippingCity}
                              </div>
                            )}
                        </div>
                      </div>
                      <div className="col-md-4">
                        <div className="form-group">
                          <label htmlFor="shippingState">State *</label>
                          <input
                            type="text"
                            id="shippingState"
                            onChange={(e) => {
                              setShippingState(e.target.value);
                              validateField("shippingState", e.target.value);
                            }}
                            onBlur={(e) =>
                              handleFieldBlur("shippingState", e.target.value)
                            }
                            value={shippingState}
                            placeholder="State *"
                            required
                            className={`form-control ${getFieldValidationClass(
                              "shippingState",
                            )}`}
                          />
                          {fieldTouched.shippingState &&
                            validationErrors.shippingState && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.shippingState}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="shippingPincode">Pincode</label>
                          <input
                            type="text"
                            id="shippingPincode"
                            onChange={(e) => {
                              setShippingPincode(e.target.value);
                              validateField("shippingPincode", e.target.value);
                            }}
                            onBlur={(e) =>
                              handleFieldBlur("shippingPincode", e.target.value)
                            }
                            value={shippingPincode}
                            placeholder="Pincode (6 digits)"
                            required
                            className={`form-control ${getFieldValidationClass(
                              "shippingPincode",
                            )}`}
                          />
                          {fieldTouched.shippingPincode &&
                            validationErrors.shippingPincode && (
                              <div className="invalid-feedback d-block">
                                {validationErrors.shippingPincode}
                              </div>
                            )}
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </section>

        <section className="content" data-section="items">
          <div className="container-fluid">
            <div className="card card-primary">
              <div className="card-header">Add Item</div>
              <div className="card-body">
                <div className="row">
                  <div className="col-md-12">
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="item">Item</label>
                          <input
                            type="text"
                            id="item"
                            onChange={(e) => {
                              setItem(e.target.value);
                              validateField("item", e.target.value);
                            }}
                            onBlur={(e) =>
                              handleFieldBlur("item", e.target.value)
                            }
                            value={item}
                            placeholder="Item Name"
                            required
                            className={`form-control ${getFieldValidationClass(
                              "item",
                            )}`}
                          />
                          {fieldTouched.item && validationErrors.item && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.item}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="rate">Rate</label>
                          <input
                            type="text"
                            id="rate"
                            onChange={(e) => {
                              const newValue = !isNaN(e.target.value)
                                ? e.target.value
                                    .replace(/[^\d.]/g, "")
                                    .replace(/\./, "x")
                                    .replace(/\./g, "")
                                    .replace(/x/, ".") === ""
                                  ? 0
                                  : e.target.value
                                      .replace(/[^\d.]/g, "")
                                      .replace(/\./, "x")
                                      .replace(/\./g, "")
                                      .replace(/x/, ".")
                                : rate;
                              setRate(newValue);
                              validateField("rate", newValue);
                            }}
                            onBlur={(e) => handleFieldBlur("rate", rate)}
                            value={rate}
                            placeholder="Rate"
                            required
                            className={`form-control ${getFieldValidationClass(
                              "rate",
                            )}`}
                          />
                          {fieldTouched.rate && validationErrors.rate && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.rate}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="qty">Qty</label>
                          <input
                            type="text"
                            id="qty"
                            onChange={(e) => {
                              const newValue = !isNaN(e.target.value)
                                ? e.target.value.replace(/\D/g, "") === ""
                                  ? 1
                                  : e.target.value.replace(/\D/g, "")
                                : qty;
                              setQty(newValue);
                              validateField("qty", newValue);
                            }}
                            onBlur={(e) => handleFieldBlur("qty", qty)}
                            value={qty}
                            placeholder="Quantity"
                            required
                            className={`form-control ${getFieldValidationClass(
                              "qty",
                            )}`}
                          />
                          {fieldTouched.qty && validationErrors.qty && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.qty}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <label htmlFor="sac">SAC</label>
                          <input
                            type="text"
                            id="sac"
                            onChange={(e) => {
                              setSac(e.target.value);
                              validateField("sac", e.target.value);
                            }}
                            onBlur={(e) =>
                              handleFieldBlur("sac", e.target.value)
                            }
                            value={sac}
                            placeholder="SAC (6 or 8 digits)"
                            required
                            className={`form-control ${getFieldValidationClass(
                              "sac",
                            )}`}
                          />
                          {fieldTouched.sac && validationErrors.sac && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.sac}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="gst">GST %</label>
                          <input
                            type="text"
                            id="gst"
                            onChange={(e) => {
                              const newValue = !isNaN(e.target.value)
                                ? e.target.value
                                    .replace(/[^\d.]/g, "")
                                    .replace(/\./, "x")
                                    .replace(/\./g, "")
                                    .replace(/x/, ".") === ""
                                  ? 0
                                  : e.target.value
                                      .replace(/[^\d.]/g, "")
                                      .replace(/\./, "x")
                                      .replace(/\./g, "")
                                      .replace(/x/, ".")
                                : gst;
                              setGst(newValue);
                              validateField("gst", newValue);
                            }}
                            onBlur={(e) => handleFieldBlur("gst", gst)}
                            value={gst}
                            placeholder="GST % (0, 5, 12, 18, 28)"
                            required
                            className={`form-control ${getFieldValidationClass(
                              "gst",
                            )}`}
                          />
                          {fieldTouched.gst && validationErrors.gst && (
                            <div className="invalid-feedback d-block">
                              {validationErrors.gst}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="col-md-3">
                        <div className="form-group">
                          <label htmlFor="addItem">Add Item</label>
                          <button
                            className="btn btn-success btn-block"
                            onClick={addItem}
                          >
                            Add Item
                          </button>
                        </div>
                      </div>
                    </div>
                    <div className="row">
                      <div className="col-md-6">
                        <div className="form-group">
                          <div className="mt-2">
                            <label className="form-label">
                              Additional Details
                            </label>
                            {itemDescriptions.map((desc, index) => (
                              <div key={index} className="input-group mb-1">
                                <input
                                  type="text"
                                  value={desc}
                                  onChange={(e) => {
                                    const newDescriptions = [
                                      ...itemDescriptions,
                                    ];
                                    newDescriptions[index] = e.target.value;
                                    setItemDescriptions(newDescriptions);
                                  }}
                                  className="form-control form-control-sm"
                                  placeholder={`Detail ${index + 1}`}
                                />
                                {itemDescriptions.length > 1 && (
                                  <button
                                    type="button"
                                    className="btn btn-sm btn-outline-danger"
                                    onClick={() => {
                                      const newDescriptions =
                                        itemDescriptions.filter(
                                          (_, i) => i !== index,
                                        );
                                      setItemDescriptions(
                                        newDescriptions.length > 0
                                          ? newDescriptions
                                          : [""],
                                      );
                                    }}
                                  >
                                    ×
                                  </button>
                                )}
                              </div>
                            ))}
                            <button
                              type="button"
                              className="btn btn-sm btn-outline-secondary"
                              onClick={() => {
                                const nonEmptyDescriptions =
                                  itemDescriptions.filter(
                                    (desc) => desc.trim() !== "",
                                  );
                                const uniqueDescriptions = [
                                  ...new Set(nonEmptyDescriptions),
                                ];
                                if (
                                  uniqueDescriptions.length !==
                                  nonEmptyDescriptions.length
                                ) {
                                  Swal.fire({
                                    icon: "warning",
                                    title: "Duplicate Descriptions",
                                    html: `<div style="text-align: left;">
                                              <p><strong>Duplicate description lines detected:</strong></p>
                                              <p>Please remove duplicate description lines before adding a new one.</p>
                                             </div>`,
                                    confirmButtonText: "OK",
                                    width: "500px",
                                    ...swalConfig,
                                  });
                                  return;
                                }

                                setItemDescriptions([...itemDescriptions, ""]);
                              }}
                            >
                              + Add Detail Line
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>
    </>
  );
};

export default GeneratePdfInvoice;
